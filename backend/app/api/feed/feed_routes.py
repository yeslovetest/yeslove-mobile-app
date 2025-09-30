from flask import request, current_app
from flask_restx import Namespace, Resource, reqparse

from app.logging_setup import setup_logger

from app.utils import require_auth

logger = setup_logger()

api = Namespace("feed", description="API Endpoints")

@api.route("/feed")
class Feed(Resource):
    from .feed_models import FeedQuery, FeedResponse
    @require_auth()
    @api.param("feed_type", "Type of feed: 'all', 'mentions', 'favorites', 'friends', 'groups'")
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
        feed_cache = FeedCacheService()
        if feed_type == "all":
            cached_feed = feed_cache.get_user_feed(user.id, page, per_page)
            if cached_feed:
                return cached_feed, 200

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
            
            query = Post.query.filter(Post.user_id.in_(friend_ids)).order_by(Post.timestamp.desc()) 
            
        elif feed_type == "groups":
            query = Post.query.filter_by(user_id=None)  # TODO: Replace with group logic
        else:
            following = [follow.followed_id for follow in user.following]
            following.append(user.id)
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
                "author": post.author.username,
                "author_id": post.author.keycloak_id,
                "author_pic": post.author.profile_pic_url,
                "content": post.content,
                "image_url": post.image_url,
                "timestamp": post.timestamp.isoformat(),
                "likes": len(post.likes),
                "comments": len(post.comments),
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
        if feed_type == "all":
            feed_cache.cache_user_feed(user.id, feed_data, page, per_page)
        
        return feed_data, 200



@api.route("/post")
class CreatePost(Resource):
    from .feed_models import CreatePostRequest
    @require_auth()
    @api.expect(CreatePostRequest)
    @api.response(201, "Post created successfully")
    def post(self):
        """Create a new post."""
        from app.models import User, Post, Follow, db
        from app.notifications import send_push_notification_to_users

        data = request.json
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        if not data.get("content"):
            return {"message": "Post content cannot be empty"}, 400

        # Handle image upload to S3 if provided
        image_url = None
        if 'image' in request.files:
            from app.services.media.media_service import MediaService
            try:
                upload_result = MediaService.upload_file(
                    file=request.files['image'],
                    user_id=user.id,
                    folder='posts'
                )
                image_url = upload_result.get('s3_url') if upload_result else None
            except Exception as e:
                logger.error(f"Post image upload failed: {e}")
        
        post = Post(content=data["content"], user_id=user.id, image_url=image_url)
        db.session.add(post)
        db.session.commit()
        
        # Add post to Neptune graph
        if hasattr(current_app, 'graph_repository'):
            try:
                current_app.graph_repository.merge_post_node(
                    post_id=post.id,
                    author_id=user.keycloak_id,
                    props={"content": data["content"][:100], "timestamp": post.timestamp.isoformat()}
                )
            except Exception as e:
                logger.warning(f"Neptune post creation failed: {e}")
        
        # Fanout post to followers
        from app.services.fanout_service import FanoutService
        fanout_service = FanoutService()
        fanout_service.fanout_post(post.id, user.id)

        # Send push notification to followers
        follower_links = Follow.query.filter_by(followed_id=user.id).all()
        follower_user_ids = [f.follower_id for f in follower_links]
        
        if follower_user_ids:
            from app.services.push_notification_service import PushNotificationService
            try:
                PushNotificationService.send_to_multiple_users(
                    user_ids=follower_user_ids,
                    title="New Post",
                    body=f"{user.username}: {data['content'][:50]}...",
                    data={"type": "new_post", "post_id": post.id},
                    notification_type="posts"
                )
            except Exception as e:
                logger.error(f"Push notification failed: {e}")

        return {"message": "Post created successfully"}, 201
    
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
                    "author": reaction.user.username,
                    "picture": reaction.user.profile_pic,
                }
            for reaction in reactions]
            }, 200
    
@api.route("/post/<int:post_id>/reaction")
class ReactToPost(Resource):
    from .feed_models import ReactionRequest, ReactToPostResponse
    @require_auth()
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
        post = Post.query.get(post_id)
        if post and post.user_id != user.id:
            from app.services.push_notification_service import PushNotificationService
            PushNotificationService.send_to_user(
                user_id=post.user_id,
                title="New Like",
                body=f"{user.username} liked your post",
                data={"type": "like", "post_id": post_id},
                notification_type="likes"
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
    @api.expect(AddCommentRequest)
    def post(self, post_id):
        """Add a comment to a post."""
        from app.models import User, Comment, db
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        data = request.json
        content = data.get("content")

        if not content:
            return {"message": "Comment cannot be empty"}, 400

        comment = Comment(content=content, user_id=user.id, post_id=post_id)
        db.session.add(comment)
        db.session.commit()
        
        # Notify post author about comment
        from app.models import Post
        post = Post.query.get(post_id)
        if post and post.user_id != user.id:
            from app.services.push_notification_service import PushNotificationService
            PushNotificationService.send_to_user(
                user_id=post.user_id,
                title="New Comment",
                body=f"{user.username} commented on your post",
                data={"type": "comment", "post_id": post_id},
                notification_type="comments"
            )
        
        return {"message": "Comment added"}, 201


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
                    "author": comment.user.username,
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
    @api.expect(FollowUserRequest)  # ✅ Attach model
    def post(self, keycloak_id):
        """Follow or unfollow a user."""
        from app.models import User, Follow, db
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        target_user = User.query.filter_by(keycloak_id=keycloak_id).first()

        if not user or not target_user:
            return {"message": "User not found"}, 404

        follow_action = request.json.get("action", "follow")  # Default to "follow"
        follow_type = request.json.get("follow_type", "basic")
        
        # Get existing follow relationships (both directions)
        follows = Follow.query.filter(
            ((Follow.follower_id == user.id) & (Follow.followed_id == target_user.id)) | 
            ((Follow.follower_id == target_user.id) & (Follow.followed_id == user.id))
        ).all()
        existing = {(f.follower_id, f.followed_id): f for f in follows}

        followby_current_user = existing.get((user.id, target_user.id))
        followby_target_user = existing.get((target_user.id, user.id))

        # Unfollow
        if follow_action == "unfollow":
            if followby_current_user:
                db.session.delete(followby_current_user)
                if follow_type == "friend" and followby_target_user:
                   db.session.delete(followby_target_user) 
                db.session.commit()
                
                # Remove from Neptune
                if hasattr(current_app, 'graph_repository'):
                    try:
                        current_app.graph_repository.unfollow(
                            follower_id=user.keycloak_id,
                            followed_id=target_user.keycloak_id
                        )
                        if follow_type == "friend":
                            current_app.graph_repository.unfollow(
                                follower_id=target_user.keycloak_id,
                                followed_id=user.keycloak_id
                            )
                    except Exception as e:
                        logger.warning(f"Neptune unfollow failed: {e}")
                
                return {"message": "Unfollowed successfully"}, 200
            return {"message": "You are not following this user"}, 400
        
        # Follow
        if followby_current_user:
            # Already following
            if follow_type == "basic":
                return {"message": "Already following"}, 400
            if follow_type == "friend":
                followby_current_user.follow_type = "friend" 
                # Add reverse record if not exists  (send frienship request by email, To be done later)
                if not followby_target_user:
                    new_follow = Follow(follower_id=target_user.id, followed_id=user.id, follow_type="friend")
                    db.session.add(new_follow)
                    db.session.commit()
                    return {"message": "Connected as friend"}, 201
                # Otherwise just update both
                followby_target_user.follow_type = "friend"
                db.session.commit()
                return {"message": "Follow type updated"}, 201

        # Create new follows
        records = []
        if follow_type == "friend": # send frienship request by email, To be done later
            records.append(Follow(follower_id=user.id, followed_id=target_user.id, follow_type="friend"))
            records.append(Follow(follower_id=target_user.id, followed_id=user.id, follow_type="friend"))
            db.session.add_all(records)
            db.session.commit()
            
            # Create follow in Neptune
            if hasattr(current_app, 'graph_repository'):
                try:
                    current_app.graph_repository.follow(
                        follower_id=user.keycloak_id,
                        followed_id=target_user.keycloak_id,
                        follow_type="friend"
                    )
                    current_app.graph_repository.follow(
                        follower_id=target_user.keycloak_id,
                        followed_id=user.keycloak_id,
                        follow_type="friend"
                    )
                except Exception as e:
                    logger.warning(f"Neptune follow failed: {e}")
            
            return {"message": "Connected as friend"}, 201

        # Basic follow
        db.session.add(Follow(follower_id=user.id, followed_id=target_user.id, follow_type="basic"))
        db.session.commit()
        
        # Create follow in Neptune
        if hasattr(current_app, 'graph_repository'):
            try:
                current_app.graph_repository.follow(
                    follower_id=user.keycloak_id,
                    followed_id=target_user.keycloak_id,
                    follow_type="basic"
                )
            except Exception as e:
                logger.warning(f"Neptune follow failed: {e}")
        
        return {"message": "Following Successfully"}, 201


@api.route("/followers/<string:keycloak_id>")
class GetFollowers(Resource):
    from .feed_models import GetFollowersRequest, GetFollowersResponse
    @require_auth()
    @api.expect(GetFollowersRequest)  # ✅ Attach model
    @api.response(code=200, description="List of followers", model=GetFollowersResponse)
    def get(self, keycloak_id):
        """Fetch all followers of a user."""
        from app.models import Follow, User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
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
    @api.expect(GetFollowingRequest)  # ✅ Attach model
    @api.response(code=200, description="List of following users", model=GetFollowingResponse)
    def get(self, keycloak_id):
        """Fetch all users the current user is following."""
        from app.models import Follow, User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        following = Follow.query.filter_by(follower_id=user.id).all()
        return {'following':
                [
                    {"id": follow.followed.keycloak_id, "follow_type": follow.follow_type,
                      "username": follow.followed.username, 'profile_pic': follow.followed.profile_pic}
                    for follow in following
                ]}, 200