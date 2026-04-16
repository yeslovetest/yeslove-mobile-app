from flask import request, current_app
from flask_restx import Namespace, Resource, reqparse
from werkzeug.datastructures import FileStorage
from sqlalchemy import true
from app.utils.moderation_utils import handle_content_moderation, check_user_suspension
from app.logging_setup import setup_logger

from app.utils import require_auth
from datetime import datetime
from app.utils.rate_limiter import read_rate_limit, write_rate_limit

logger = setup_logger()
post_parser = reqparse.RequestParser()

api = Namespace("feed", description="API Endpoints")

@api.route("/feed")
class Feed(Resource):
    from .feed_models import FeedQuery, FeedResponse
    @read_rate_limit
    @require_auth()
    @api.doc(security='Bearer')
    @api.param("feed_type", "Type of feed: 'all', 'mentions', 'favorites', 'friends', 'groups'", type='string', default='all')
    @api.param("page", "Page number for pagination", type='integer', default=1)
    @api.param("per_page", "Number of posts per page", type='integer', default=10)
    @api.response(code=200, description="", model=FeedResponse)
    def get(self):
        """Fetch posts based on selected feed type (All Updates, Mentions, Favorites, Friends, Groups) with pagination."""
        from app.models import User, Post, Like, Reaction
        from app.services.feed_cache_service import FeedCacheService
        
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        feed_type = request.args.get("feed_type", "all")
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        
        # Try cache first for main feed
        ''' to be uncommented later (during production)
        feed_cache = FeedCacheService()
        if feed_type == "all":
            cached_feed = feed_cache.get_user_feed(user.id, page, per_page)
            if cached_feed:
                return cached_feed, 200
        '''    

        # Build query based on feed type
        
        if feed_type == "mentions":
            query = Post.query.filter(Post.content.contains(f"@{user.username}")).order_by(Post.timestamp.desc())
        elif feed_type == "favorites":
            query = Post.query.join(Like).filter(Like.user_id == user.id).order_by(Post.timestamp.desc())
        elif feed_type == "friends":
            # Try Neptune for friend recommendations first
            friend_ids = [follow.followed_id for follow in user.following]
            if hasattr(current_app, 'graph_repository') and not friend_ids:
                try:
                    recommendations = current_app.graph_repository.recommendations(
                        user_id=user.keycloak_id, limit=50
                    )
                    if recommendations:
                        from app.models import User as UserModel
                        rec_users = UserModel.query.filter(
                            UserModel.keycloak_id.in_([r["user_id"] for r in recommendations])
                        ).all()
                        friend_ids = [u.id for u in rec_users]
                except Exception as e:
                    logger.warning(f"Neptune recommendations failed: {e}")
            
            query = Post.query.filter(Post.is_anonymous != true(), Post.user_id.in_(friend_ids)).order_by(Post.timestamp.desc()) 
            
        elif feed_type == "groups":
            query = Post.query.filter_by(user_id=None)  # TODO: Replace with group logic
        else:  # "all"
            # "all" should be platform-wide updates, not only followed users.
            query = Post.query.order_by(Post.timestamp.desc())

        paginated_posts = query.paginate(page=page, per_page=per_page, error_out=False)
        posts = paginated_posts.items

        post_ids = [post.id for post in posts]

        # Fetch all reactions by the current user for these posts and create map for quick lookup
        reactions = Reaction.query.filter(
            Reaction.post_id.in_(post_ids), Reaction.user_id == user.id).all()
        reaction_map = {reaction.post_id: reaction for reaction in reactions}

       

        feed_data = {
            "posts": [{
                "id": post.id,
                "author": post.author.username if not post.is_anonymous else 'Anonymous User',
                "author_id": post.author.keycloak_id if not post.is_anonymous else None,
                "author_pic": post.author.profile_pic_url if not post.is_anonymous else None,
                "content": post.content,
                "media": [{
                    "id": pm.media_id,
                    "url": pm.media.s3_url or f"/api/media/{pm.media_id}",
                    "type": pm.media.content_type,
                    "filename": pm.media.filename
                } for pm in post.post_media],
                "timestamp": post.timestamp.isoformat(),
                "likes": len(post.likes),
                "comments": len(post.comments),
                "anonymous": post.is_anonymous,
                "media_files": [
                    {
                        "uri": media.s3_url or f"/api/media/{media.id}",
                        "type": media.content_type,
                        "width": media.width,
                        "height": media.height
                    }
                    for media in (post.media_files or [])
                ],
                "current_user_reaction": reaction_map.get(post.id).reaction_type if reaction_map.get(post.id) else None,
            } for post in posts],
            "pagination": {
                "page": paginated_posts.page,
                "per_page": paginated_posts.per_page,
                "total_posts": paginated_posts.total,
                "total_pages": paginated_posts.pages,
                "has_next": paginated_posts.has_next,
                "has_prev": paginated_posts.has_prev
            }
        }
        
        # Cache the feed data for main feed
        '''
        if feed_type == "all":
            feed_cache.cache_user_feed(user.id, feed_data, page, per_page)
        '''    
        
        return feed_data, 200


@api.route("/post")
class CreatePost(Resource):
    """Create a new post (supports text + optional image or video upload)."""
    from .feed_models import CreatePostRequest

    post_parser.add_argument(
        'content',
        type=str,
        required=True,
        location='form',
        help='Content of the post'
    )
    post_parser.add_argument(
        'anonymous',
        type=str,
        required=False,
        location='form',
        help='if post is to be anonymous'
    )
    post_parser.add_argument(
        'media', 
        type=FileStorage,
        required=False,
        location='files',
        action='append',
        help='Multiple media files (images/videos/audio)'
    )

    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(post_parser)
    @api.response(201, "Post created successfully")
    def post(self):
        """Create a new post."""
        from app.services.media.media_service import MediaService
        from app.services.fanout_service import FanoutService
        from app.services.push_notification_service import PushNotificationService
        from app.monitoring.metrics import track_post_creation
        from app.models import User, Post, Follow, db, Media, ModerationLog
        from datetime import datetime


        logger.info("Content-Type header: %s", request.content_type)
        logger.info("Request form keys: %s", list(request.form.keys()))
        logger.info("Request files keys: %s", list(request.files.keys()))

        args = post_parser.parse_args()
        content = args.get("content", "")
        files = args.get("media") or []
        is_anonymous = str(args.get("anonymous")).lower() == "true"

        logger.info("is_anonymous: %s", is_anonymous)
              
        if not isinstance(files, list):
            files = [files] if files else []
        logger.info(f'files found: {len(files)}')

        """Create a new post with automatic moderation."""

        if not content:
            return {"message": "Post content cannot be empty"}, 400
          
         # ✅ Validate user
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
          
        # Check if user is suspended
        if check_user_suspension(user.id):
            return {"message": "Account suspended. Cannot create posts."}, 403

        # Moderate content
        moderation_result = handle_content_moderation(content, user.id, "post")
        
        if moderation_result["status"] == "error":
            return {"message": moderation_result["message"]}, 500
        
        # Handle blocked content
        if not moderation_result["allowed"]:
            return {
                "message": moderation_result["message"],
                "toxicity_score": moderation_result["score"],
                "triggered": moderation_result.get("triggered", {})
            }, 400
        
        status = moderation_result["status"]
        score = moderation_result["score"]

        media_ids = []

        # ✅ Create post record
        post = Post(
            content=content,
            user_id=user.id,
            is_anonymous = is_anonymous 
        )
        db.session.add(post)
        db.session.flush()  # Get post.id

        # ✅ Handle multiple file uploads
        if files:
            for file in files:
                try:
                    result = MediaService.store_file(file=file, user_id=user.id, post_id=post.id)
                    media_ids.append(result.get("media_id"))
                    logger.info(f'Media file uploaded: {result.get("media_id")}')
                except Exception as e:
                    file_name = getattr(file, "filename", "unknown-file")
                    logger.error(f"Media upload failed for {file_name}: {e}")
        '''
       
        # ✅ Link media to post
        if media_ids:
            from app.models import PostMedia
            for media_id in media_ids:
                post_media = PostMedia(post_id=post.id, media_id=media_id)
                db.session.add(post_media)
         '''
        db.session.commit()
        
        # Posts are not synced to chatbot - only blogs are synced
        
        message = {
            "visible": "Post created successfully.",
            "flagged": "Post was flagged for review.",
            "removed": "Your post was removed for violating guidelines."
        }.get(status, "Post created successfully.")

        
        # Track post creation metric
        from app.monitoring.metrics import track_post_creation
        track_post_creation()

        if hasattr(current_app, 'graph_repository'):
            try:
                current_app.graph_repository.merge_post_node(
                    post_id=post.id,
                    author_id=user.keycloak_id,
                    props={
                        "content": content[:100],
                        "timestamp": post.timestamp.isoformat()
                    }
                )
            except Exception as e:
                logger.warning(f"Neptune post creation failed: {e}")

        fanout_service = FanoutService()
        fanout_service.fanout_post(post.id, user.id)

        # Send push notification to followers

        follower_links = Follow.query.filter_by(followed_id=user.id).all()
        follower_user_ids = [f.follower_id for f in follower_links]
        
        if follower_user_ids and not is_anonymous:   # don't send notification if post is anonymous
            try:
                PushNotificationService.send_to_multiple_users(
                    user_ids=follower_user_ids,
                    title="New Post",
                    body=f"{user.username}: {content[:50]}...",
                    data={"type": "new_post", "post_id": post.id, 'image': user.profile_pic_url},
                    notification_type="posts"
                )
            except Exception as e:
                logger.error(f"Push notification failed: {e}")

        return {
            "message": message,
            "toxicity_score": score,
            "post_id": post.id,
            "status": status,
            "media_count": len(media_ids)
        }, 201


@api.route("/post/<int:post_id>")
class GetPost(Resource):
    from .feed_models import Post
    @require_auth()
    @api.response(code=200, description="Post details", model=Post)
    def get(self, post_id):
        """Fetch a single post by ID."""
        from app.models import Post, Reaction, User
        post = Post.query.get_or_404(post_id)
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        user_reaction = Reaction.query.filter_by(post_id=post_id, user_id=user.id).first()
        return {
            "id": post.id,
            "author": post.author.username if not post.is_anonymous else 'Anonymous User',
            "author_id": post.author.keycloak_id if not post.is_anonymous else None,
            "author_pic": post.author.profile_pic_url if not post.is_anonymous else None,
            "content": post.content,
            "image": post.image_url,
            "video_url": post.video_url,
            "timestamp": post.timestamp.isoformat(),
            "likes": len(post.likes),
            "comments": len(post.comments),
            "anonymous": post.is_anonymous,
            "media_files": [
                {
                    'uri': media.s3_url or f"/api/media/{media.id}",
                    'type': media.content_type,
                    'width': media.width,
                    'height': media.height
                }
                for media in post.media_files if post.media_files
            ],
            "current_user_reaction": user_reaction.reaction_type if user_reaction else None,
        }, 200
    
# -------------------------
# 🚀 Reaction ROUTES
# -------------------------
 
@api.route("/post/<int:post_id>/reactions")
class GetReactions(Resource):
    from .feed_models import GetReactionsResponse
    @api.response(code=200, description="List of reactions", model=GetReactionsResponse)
    def get(self, post_id):
        """Fetch all reactions for a post."""
        from app.models import Reaction
        reactions = Reaction.query.filter_by(post_id=post_id).all()
        return {
            "reactions": [
                {
                    "id": reaction.id,
                    "type": reaction.reaction_type,
                    "author": reaction.user.username if not reaction.post.is_anonymous else 'Anonymous User',
                    "picture": reaction.user.profile_pic_url if not reaction.post.is_anonymous else None,
                }
                for reaction in reactions
            ]
        }, 200
    
@api.route("/post/<int:post_id>/reaction")
class ReactToPost(Resource):
    from .feed_models import ReactionRequest, ReactToPostResponse
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(ReactionRequest)  # ✅ Attach model
    @api.response(code=200, description="success", model=ReactToPostResponse)
    def post(self, post_id):
        """Add or update a reaction to a post (like, love, laugh, etc.)."""
        from app.models import User, Post, Reaction, db
        data = request.json
        reaction_type = data.get("reaction_type")  # Expected values: like, love, laugh, angry, etc.
        
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        # ✅ Check if user already reacted to this post
        existing_reaction = Reaction.query.filter_by(user_id=user.id, post_id=post_id).first()

        if existing_reaction:
            if existing_reaction.reaction_type == reaction_type:
                db.session.delete(existing_reaction)  # Remove reaction if same type
                db.session.commit()
                return {"message": f"Removed {reaction_type} reaction"}, 200
            else:
                existing_reaction.reaction_type = reaction_type  # Update reaction type
                db.session.commit()
                return {"message": f"Updated reaction to {reaction_type}"}, 200
        
        # ✅ Add new reaction
        new_reaction = Reaction(user_id=user.id, post_id=post_id, reaction_type=reaction_type)
        db.session.add(new_reaction)
        db.session.commit()
        return {"message": f"Added {reaction_type} reaction"}, 201
    # -------------------------
# 🚀 LIKE ROUTES
# -------------------------

@api.route("/post/<int:post_id>/like")
class LikePost(Resource):
    from .feed_models import LikePostRequest
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(LikePostRequest)  # ✅ Attach model
    def post(self, post_id):
        """Like or unlike a post."""
        from app.models import User, Like, db
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            logger.warning(f"❌ User with Keycloak ID {request.user['keycloak_id']} not found")
            return {"message": "User not found"}, 404

        existing_like = Like.query.filter_by(user_id=user.id, post_id=post_id).first()

        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            logger.info(f"🔹 User {user.username} unliked post {post_id}")
            return {"message": "Like removed"}, 200

        new_like = Like(user_id=user.id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        
        # Add like to Neptune graph
        if hasattr(current_app, 'graph_repository'):
            try:
                current_app.graph_repository.like_post(
                    user_id=user.keycloak_id,
                    post_id=post_id,
                    reaction_type="like"
                )
            except Exception as e:
                logger.warning(f"Neptune like failed: {e}")
        
        # Notify post author about like
        from app.models import Post
        from app.services.notification_service import NotificationService
        post = Post.query.get(post_id)
        if post and post.user_id != user.id and not post.is_anonymous:
            NotificationService.create_notification(
                user_id=post.user_id,
                title="New Like",
                body=f"{user.username} liked your post",
                notification_type="likes",
                data={"type": "like", "post_id": post_id, "user_id": user.id}
            )
        
        logger.info(f"✅ User {user.username} liked post {post_id}")
        return {"message": "Post liked"}, 201

# -------------------------
# 🚀 COMMENT ROUTES
# -------------------------

@api.route("/post/<int:post_id>/comment")
class AddComment(Resource):
    from .feed_models import AddCommentRequest
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(AddCommentRequest)
    def post(self, post_id):
        """Add a comment to a post with moderation."""
        from app.models import User, Comment, ModerationLog, db
        from datetime import datetime

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        data = request.json
        content = data.get("content")

        if not content:
            return {"message": "Comment cannot be empty"}, 400

        # Check if user is suspended
        if check_user_suspension(user.id):
            return {"message": "Account suspended. Cannot add comments."}, 403

        # Moderate content
        moderation_result = handle_content_moderation(content, user.id, "comment")
        
        if moderation_result["status"] == "error":
            return {"message": moderation_result["message"]}, 500
        
        if not moderation_result["allowed"]:
            db.session.commit()  # Save moderation log
            return {
                "message": moderation_result["message"],
                "toxicity_score": moderation_result["score"],
                "triggered": moderation_result.get("triggered", {})
            }, 400
        
        score = moderation_result["score"]
        status = moderation_result["status"]

        # ✅ Save comment anyway, maybe flagged
        comment = Comment(content=content, user_id=user.id, post_id=post_id)
        db.session.add(comment)
        db.session.commit()

        message = "Comment added"
        if status == "flagged":
            message += " (flagged for review)"

        # Notify post author about comment
        from app.models import Post
        from app.services.notification_service import NotificationService
        post = Post.query.get(post_id)

        if post and post.user_id != user.id and not post.is_anonymous:
            NotificationService.create_notification(
                user_id=post.user_id,
                title="New Comment",
                body=f"{user.username} commented on your post",
                notification_type="comments",
                data={"type": "comment", "post_id": post_id, "user_id": user.id}
            )
        
        return {
            "message": message,
            "toxicity_score": score
        }, 201


@api.route("/post/<int:post_id>/comments")
class GetComments(Resource):
    from .feed_models import GetCommentResponse
    @api.response(code=200, description="List of comments", model=GetCommentResponse)
    def get(self, post_id):
        """Fetch all comments for a post."""
        from app.models import Comment
        comments = Comment.query.filter_by(post_id=post_id).all()
        
        return {
            "comments": [
                {
                    "id": comment.id,
                    "content": comment.content,
                    "author": comment.user.username if not comment.post.is_anonymous else 'Anonymous User',
                    "timestamp": comment.timestamp.isoformat() if comment.timestamp else None,
                }
            for comment in comments]
            }, 200
    

# -------------------------
# 🚀 FOLLOW ROUTES
# -------------------------

@api.route("/follow/<string:keycloak_id>")
class FollowUser(Resource):
    from .feed_models import FollowUserRequest
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(FollowUserRequest)  # ✅ Attach model
    def post(self, keycloak_id):
        """Follow or unfollow a user."""
        from app.models import User, Follow, Notification, db
        from app.services.notification_service import NotificationService
        from app.utils.common_helpers import get_current_user, safe_neptune_operation

        def resolve_friend_request_notifications(recipient_user_id: int, requester_user_id: int) -> None:
            """Mark pending friend request notifications as read once request state changes."""
            candidate_notifications = Notification.query.filter_by(
                user_id=recipient_user_id,
                notification_type="follows",
                is_read=False,
            ).all()

            changed = False
            for item in candidate_notifications:
                payload = item.get_data() or {}
                if payload.get("type") == "friend_request" and payload.get("user_id") == requester_user_id:
                    item.is_read = True
                    changed = True

            if changed:
                db.session.flush()
        
        user, error_response, status_code = get_current_user()
        if error_response:
            return error_response, status_code
            
        target_user = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not target_user:
            return {"message": "Target user not found"}, 404

        if target_user.id == user.id:
            return {"message": "You cannot follow yourself"}, 400

        data = request.get_json(silent=True) or {}
        follow_action = data.get("action", "follow")  # Default to "follow"
        follow_type = data.get("follow_type", "basic")

        if follow_action not in {"follow", "unfollow", "decline"}:
            return {"message": "Invalid follow action"}, 400

        if follow_type not in {"basic", "friend"}:
            return {"message": "Invalid follow type"}, 400
        
        # Get existing follow relationships (both directions)
        follows = Follow.query.filter(
            ((Follow.follower_id == user.id) & (Follow.followed_id == target_user.id)) | 
            ((Follow.follower_id == target_user.id) & (Follow.followed_id == user.id))
        ).all()
        existing = {(f.follower_id, f.followed_id): f for f in follows}

        followby_current_user = existing.get((user.id, target_user.id))
        followby_target_user = existing.get((target_user.id, user.id))
        is_mutual_friendship = (
            followby_current_user is not None
            and followby_target_user is not None
            and followby_current_user.follow_type == "friend"
            and followby_target_user.follow_type == "friend"
        )

        # Unfollow
        if follow_action == "unfollow":
            if followby_current_user:
                remove_reverse_friend = (
                    followby_current_user.follow_type == "friend"
                    and followby_target_user is not None
                    and followby_target_user.follow_type == "friend"
                )

                is_canceling_pending_friend_request = (
                    followby_current_user.follow_type == "friend"
                    and not remove_reverse_friend
                )

                db.session.delete(followby_current_user)
                if is_canceling_pending_friend_request:
                    # Sender canceled an outgoing request; clear unread request notification for recipient.
                    resolve_friend_request_notifications(target_user.id, user.id)
                logger.info(f"User {user.username} unfollowed {target_user.username}")
                if remove_reverse_friend:
                    db.session.delete(followby_target_user)
                    logger.info("Also removed reverse friend follow")
                db.session.commit()
                
                # Remove from Neptune
                if hasattr(current_app, 'graph_repository'):
                    try:
                        current_app.graph_repository.unfollow(
                            follower_id=user.keycloak_id,
                            followed_id=target_user.keycloak_id
                        )
                        if remove_reverse_friend:
                            current_app.graph_repository.unfollow(
                                follower_id=target_user.keycloak_id,
                                followed_id=user.keycloak_id
                            )
                    except Exception as e:
                        logger.warning(f"Neptune unfollow failed: {e}")
                
                if remove_reverse_friend:
                    return {"message": "Friendship removed"}, 200
                return {"message": "Unfollowed successfully"}, 200
            return {"message": "You are not following this user"}, 400

        # Decline incoming friend request
        if follow_action == "decline":
            if is_mutual_friendship:
                return {"message": "Already friends"}, 400

            incoming_request = (
                followby_target_user is not None
                and followby_target_user.follow_type == "friend"
            )
            if not incoming_request:
                return {"message": "No incoming friend request"}, 400

            db.session.delete(followby_target_user)
            # Recipient declined an incoming request; clear the corresponding unread request notification.
            resolve_friend_request_notifications(user.id, target_user.id)
            db.session.commit()

            safe_neptune_operation(
                lambda repo: repo.unfollow(target_user.keycloak_id, user.keycloak_id)
            )

            return {"message": "Friend request declined"}, 200
        
        # Follow
        if follow_type == "basic":
            if followby_current_user:
                if is_mutual_friendship:
                    return {"message": "Already friends"}, 400
                return {"message": "Already following"}, 400

            new_follow = Follow(follower_id=user.id, followed_id=target_user.id, follow_type="basic")
            db.session.add(new_follow)
            db.session.commit()

            NotificationService.create_notification(
                user_id=target_user.id,
                title="New Follower",
                body=f"{user.username} started following you",
                notification_type="follows",
                data={
                    "type": "follow",
                    "user_id": user.id,
                    "keycloak_id": user.keycloak_id,
                    "username": user.username,
                    "image": user.profile_pic_url,
                },
            )

            safe_neptune_operation(
                lambda repo: repo.follow(user.keycloak_id, target_user.keycloak_id, "basic")
            )

            return {"message": "Followed successfully"}, 201

        # friend flow:
        # 1) first request creates one-way friend follow + notification to target
        # 2) reverse request accepts and completes mutual friendship
        if is_mutual_friendship:
            return {"message": "Already friends"}, 400

        if (
            followby_current_user
            and followby_current_user.follow_type == "friend"
            and (not followby_target_user or followby_target_user.follow_type != "friend")
        ):
            return {"message": "Friend request already sent"}, 200

        # Accept incoming friend request when reverse friend-follow already exists.
        if followby_target_user and followby_target_user.follow_type == "friend":
            if followby_current_user:
                followby_current_user.follow_type = "friend"
            else:
                db.session.add(Follow(follower_id=user.id, followed_id=target_user.id, follow_type="friend"))

            # Recipient accepted an incoming request; clear the corresponding unread request notification.
            resolve_friend_request_notifications(user.id, target_user.id)
            db.session.commit()

            NotificationService.create_notification(
                user_id=target_user.id,
                title="Friend Request Accepted",
                body=f"{user.username} accepted your friend request",
                notification_type="follows",
                data={
                    "type": "friend_request_accepted",
                    "user_id": user.id,
                    "keycloak_id": user.keycloak_id,
                    "username": user.username,
                    "image": user.profile_pic_url,
                },
            )

            safe_neptune_operation(
                lambda repo: repo.follow(user.keycloak_id, target_user.keycloak_id, "friend")
            )
            safe_neptune_operation(
                lambda repo: repo.follow(target_user.keycloak_id, user.keycloak_id, "friend")
            )

            return {"message": "Friend request accepted"}, 201

        # No reverse friend request exists yet: send/refresh outgoing friend request.
        if followby_current_user:
            followby_current_user.follow_type = "friend"
        else:
            db.session.add(Follow(follower_id=user.id, followed_id=target_user.id, follow_type="friend"))
        db.session.commit()

        NotificationService.create_notification(
            user_id=target_user.id,
            title="Friend Request",
            body=f"{user.username} sent you a friend request",
            notification_type="follows",
            data={
                "type": "friend_request",
                "user_id": user.id,
                "keycloak_id": user.keycloak_id,
                "username": user.username,
                "image": user.profile_pic_url,
            },
        )

        safe_neptune_operation(
            lambda repo: repo.follow(user.keycloak_id, target_user.keycloak_id, "friend")
        )

        return {"message": "Friend request sent"}, 201


@api.route("/friend-requests")
class GetFriendRequests(Resource):
    """List active incoming friend requests for the authenticated user."""
    @require_auth()
    @api.doc(security='Bearer')
    def get(self):
        from app.models import Follow, User
        from app.utils.common_helpers import get_current_user

        user, error_response, status_code = get_current_user()
        if error_response:
            return error_response, status_code

        incoming_requests = Follow.query.filter_by(
            followed_id=user.id,
            follow_type="friend",
        ).all()

        requester_ids = [request.follower_id for request in incoming_requests]
        outgoing_friend_links = Follow.query.filter(
            Follow.follower_id == user.id,
            Follow.followed_id.in_(requester_ids),
            Follow.follow_type == "friend",
        ).all() if requester_ids else []
        outgoing_map = {follow.followed_id: follow for follow in outgoing_friend_links}

        active_requesters = [
            request.follower_id
            for request in incoming_requests
            if request.follower_id not in outgoing_map
        ]

        requesters = User.query.filter(User.id.in_(active_requesters)).all() if active_requesters else []
        requester_map = {requester.id: requester for requester in requesters}

        return {
            "requests": [
                {
                    "keycloak_id": requester_map[requester_id].keycloak_id,
                    "username": requester_map[requester_id].username,
                    "image": requester_map[requester_id].profile_pic_url,
                }
                for requester_id in active_requesters
                if requester_id in requester_map
            ]
        }, 200


@api.route("/followers/<string:keycloak_id>")
class GetFollowers(Resource):
    from .feed_models import GetFollowersRequest, GetFollowersResponse
    @api.doc(security='Bearer')
    @require_auth()
    @api.expect(GetFollowersRequest)  # ✅ Attach model
    @api.response(code=200, description="List of followers", model=GetFollowersResponse)
    def get(self, keycloak_id):
        """Fetch all followers of a user."""
        from app.models import Follow, User
        user = User.query.filter_by(keycloak_id=keycloak_id).first()
        followers = Follow.query.filter_by(followed_id=user.id).all()
        
        return {
           "followers": [
            {"id": follow.follower_id, "username": follow.follower.username}
            for follow in followers
        ]}, 200


@api.route("/following/<string:keycloak_id>")
class GetFollowing(Resource):
    from .feed_models import GetFollowingRequest, GetFollowingResponse
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(GetFollowingRequest)  # ✅ Attach model
    @api.response(code=200, description="List of following users", model=GetFollowingResponse)
    def get(self, keycloak_id):
        """Fetch all users the current user is following."""
        from app.models import Follow, User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        following = Follow.query.filter_by(follower_id=user.id).all()

        followed_ids = [follow.followed_id for follow in following]
        reverse_friend_links = Follow.query.filter(
            Follow.follower_id.in_(followed_ids),
            Follow.followed_id == user.id,
            Follow.follow_type == "friend",
        ).all() if followed_ids else []
        reverse_friend_map = {link.follower_id: link for link in reverse_friend_links}

        def relationship_status(follow):
            if follow.follow_type == "friend":
                return "friend" if follow.followed_id in reverse_friend_map else "requested"
            return "following"

        return {'following':
                [
                    {
                        "id": follow.followed.keycloak_id,
                        "follow_type": follow.follow_type,
                        "friendship_status": relationship_status(follow),
                        "username": follow.followed.username,
                        "profile_pic": follow.followed.profile_pic_url,
                    }
                    for follow in following
                ]}, 200