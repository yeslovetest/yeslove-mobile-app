from flask import request
from flask_restx import Namespace, Resource, reqparse

from app.logging_setup import logger

from app.utils import require_auth



api = Namespace("feed", description="API Endpoints")

@api.route("/feed")
class Feed(Resource):
    from .feed_models import FeedQuery, FeedResponse
    @require_auth()
    @api.expect(FeedQuery)
    @api.response(code=200, description="", model=FeedResponse)
    def get(self):
        """Fetch posts based on selected feed type (All Updates, Mentions, Favorites, Friends, Groups) with pagination."""
        from app.models import User, Post, Like, Reaction
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        feed_type = request.args.get("feed_type", "all")
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))

        # Build query based on feed type
        if feed_type == "mentions":
            query = Post.query.filter(Post.content.contains(f"@{user.username}")).order_by(Post.timestamp.desc())
        elif feed_type == "favorites":
            query = Post.query.join(Like).filter(Like.user_id == user.id).order_by(Post.timestamp.desc())
        elif feed_type == "friends":
            friend_ids = [follow.followed_id for follow in user.following]
            query = Post.query.filter(Post.user_id.in_(friend_ids)).order_by(Post.timestamp.desc())
        elif feed_type == "groups":
            query = Post.query.filter_by(user_id=None)  # TODO: Replace with group logic
        else:  # "all"
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

        return {
            "posts": [{
                "id": post.id,
                "author": post.author.username,
                "author_id": post.author.keycloak_id,
                "author_pic": post.author.profile_pic,
                "content": post.content,
                "image": post.image,
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
        }, 200



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

        post = Post(content=data["content"], user_id=user.id)
        db.session.add(post)
        db.session.commit()

        # --- Send notification to all followers ---
        follower_links = Follow.query.filter_by(followed_id=user.id).all()
        follower_user_ids = [f.follower_id for f in follower_links]
        try:
            send_push_notification_to_users(
                user_ids=follower_user_ids,
                title="New Post",
                message=f"{user.username} just posted: {data['content'][:50]}",
                data={"post_id": post.id}
            )
        except Exception as notify_err:
            logger.error(f"Failed to send push notification for post {post.id}: {notify_err}")

        return {"message": "Post created successfully"}, 201
    
# -------------------------
# 🚀 Reaction ROUTES
# -------------------------
 
@api.route("/post/<int:post_id>/reactions")
class GetReactions(Resource):
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
    from .feed_models import ReactionRequest
    @require_auth()
    @api.expect(ReactionRequest)  # ✅ Attach model
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
        return {"message": "Comment added"}, 201


@api.route("/post/<int:post_id>/comments")
class GetComments(Resource):
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
    def post(self, user_id):
        """Follow or unfollow a user."""
        from app.models import User, Follow, db
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        target_user = User.query.get(user_id)

        if not user or not target_user:
            return {"message": "User not found"}, 404

        follow_action = request.json.get("action", "follow")  # Default to "follow"

        if follow_action == "unfollow":
            existing_follow = Follow.query.filter_by(follower_id=user.id, followed_id=user_id).first()
            if existing_follow:
                db.session.delete(existing_follow)
                db.session.commit()
                return {"message": "Unfollowed successfully"}, 200
            return {"message": "You are not following this user"}, 400

        # Follow the user
        existing_follow = Follow.query.filter_by(follower_id=user.id, followed_id=user_id).first()
        if existing_follow:
            return {"message": "Already following"}, 400

        new_follow = Follow(follower_id=user.id, followed_id=user_id)
        db.session.add(new_follow)
        db.session.commit()
        return {"message": "Followed successfully"}, 201


@api.route("/followers/<string:keycloak_id>")
class GetFollowers(Resource):
    from .feed_models import GetFollowersRequest
    @api.expect(GetFollowersRequest)  # ✅ Attach model
    def get(self, user_id):
        """Fetch all followers of a user."""
        from app.models import Follow
        followers = Follow.query.filter_by(followed_id=user_id).all()
        return [
            {"id": follow.follower_id, "username": follow.follower.username}
            for follow in followers
        ], 200


@api.route("/following/<string:keycloak_id>")
class GetFollowing(Resource):
    from .feed_models import GetFollowingRequest
    @api.expect(GetFollowingRequest)  # ✅ Attach model
    def get(self, user_id):
        """Fetch all users the current user is following."""
        from app.models import Follow
        following = Follow.query.filter_by(follower_id=user_id).all()
        return [
            {"id": follow.followed_id, "username": follow.followed.username}
            for follow in following
        ], 200