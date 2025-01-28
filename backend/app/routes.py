from flask import request, jsonify
from flask_restx import Namespace, Resource
from flask_cors import CORS
from app.models import User, Post, Comment, Follow, Like, Chat, db
from app.utils import require_auth  # ✅ Import Keycloak authentication middleware

# Create Namespace
api = Namespace("api", description="API Endpoints")

# Enable CORS for React Native compatibility
CORS(api, resources={r"/api/*": {"origins": "*"}})

# -------------------------
# 🚀 PUBLIC ROUTES (NO AUTH REQUIRED)
# -------------------------

@api.route("/user/<int:user_id>")
class PublicUserProfile(Resource):
    def get(self, user_id):
        """Fetch public user profile (No authentication required)"""
        user = User.query.get_or_404(user_id)
        return {
            "username": user.username,
            "bio": user.bio,
            "profile_pic": user.profile_pic,
        }, 200

@api.route("/public_feed")
class PublicFeed(Resource):
    def get(self):
        """Fetch public posts (No authentication required)"""
        posts = Post.query.order_by(Post.timestamp.desc()).all()
        return [{
            "id": post.id,
            "author": post.author.username,
            "content": post.content,
            "timestamp": post.timestamp.isoformat(),
            "likes": len(post.likes),
            "comments": len(post.comments)
        } for post in posts], 200

# -------------------------
# 🚀 AUTHENTICATED ROUTES (REQUIRE LOGIN)
# -------------------------

@api.route("/profile")
class UserProfile(Resource):
    @require_auth()  # 🔒 Require authentication
    def get(self):
        """Fetch user profile (Authenticated)"""
        user_id = request.user["sub"]
        user = User.query.get(user_id)

        if not user:
            return {"message": "User not found"}, 404

        return {
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "profile_pic": user.profile_pic,
        }, 200

@api.route("/feed")
class Feed(Resource):
    @require_auth()  # 🔒 Require authentication
    def get(self):
        """Fetch posts from followed users"""
        user_id = request.user["sub"]
        following_ids = [follow.followed_id for follow in Follow.query.filter_by(follower_id=user_id).all()]
        following_ids.append(user_id)  # Include user's own posts

        posts = Post.query.filter(Post.user_id.in_(following_ids)).order_by(Post.timestamp.desc()).all()

        return [{
            "id": post.id,
            "author": post.author.username,
            "author_pic": post.author.profile_pic,
            "content": post.content,
            "timestamp": post.timestamp.isoformat(),
            "likes": len(post.likes),
            "comments": len(post.comments)
        } for post in posts], 200

@api.route("/post")
class CreatePost(Resource):
    @require_auth()  # 🔒 Require authentication
    def post(self):
        """Create a new post"""
        user_id = request.user["sub"]
        data = request.json
        content = data.get("content")

        if not content:
            return {"message": "Post content cannot be empty"}, 400

        post = Post(content=content, user_id=user_id)
        db.session.add(post)
        db.session.commit()
        return {"message": "Post created successfully"}, 201

@api.route("/post/<int:post_id>/like")
class LikePost(Resource):
    @require_auth()  # 🔒 Require authentication
    def post(self, post_id):
        """Like or unlike a post"""
        user_id = request.user["sub"]
        existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()

        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return {"message": "Like removed"}, 200

        new_like = Like(user_id=user_id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        return {"message": "Post liked"}, 201

@api.route("/post/<int:post_id>/comment")
class AddComment(Resource):
    @require_auth()  # 🔒 Require authentication
    def post(self, post_id):
        """Add a comment to a post"""
        user_id = request.user["sub"]
        data = request.json
        content = data.get("content")

        if not content:
            return {"message": "Comment cannot be empty"}, 400

        comment = Comment(content=content, user_id=user_id, post_id=post_id)
        db.session.add(comment)
        db.session.commit()
        return {"message": "Comment added"}, 201

@api.route("/follow/<int:user_id>")
class FollowUser(Resource):
    @require_auth()  # 🔒 Require authentication
    def post(self, user_id):
        """Follow or unfollow a user"""
        current_user_id = request.user["sub"]
        existing_follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()

        if existing_follow:
            db.session.delete(existing_follow)
            db.session.commit()
            return {"message": "Unfollowed successfully"}

        new_follow = Follow(follower_id=current_user_id, followed_id=user_id)
        db.session.add(new_follow)
        db.session.commit()
        return {"message": "Followed successfully"}

@api.route("/send_message")
class SendMessage(Resource):
    @require_auth()  # 🔒 Require authentication
    def post(self):
        """Send a private message"""
        sender_id = request.user["sub"]
        data = request.json
        receiver_id = data["receiver_id"]
        message = data["message"]

        if not message or not receiver_id:
            return {"message": "Message and receiver ID are required"}, 400

        new_message = Chat(sender_id=sender_id, receiver_id=receiver_id, message=message)
        db.session.add(new_message)
        db.session.commit()
        return {"message": "Message sent"}, 201

@api.route("/get_messages/<int:receiver_id>")
class GetMessages(Resource):
    @require_auth()  # 🔒 Require authentication
    def get(self, receiver_id):
        """Get chat messages"""
        sender_id = request.user["sub"]
        messages = Chat.query.filter(
            ((Chat.sender_id == sender_id) & (Chat.receiver_id == receiver_id)) |
            ((Chat.sender_id == receiver_id) & (Chat.receiver_id == sender_id))
        ).order_by(Chat.timestamp.asc()).all()

        return [{"sender": msg.sender_id, "receiver": msg.receiver_id, "message": msg.message, "timestamp": msg.timestamp} for msg in messages], 200

# -------------------------
# ✅ REGISTER THE API
# -------------------------
api.add_namespace(api, path="/api")
