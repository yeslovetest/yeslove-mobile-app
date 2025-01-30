from flask import Blueprint, request, jsonify, session, current_app
import requests
from app.models import User, Post, Comment, Follow, Like, Chat, db
from flask_cors import CORS  # ✅ Allow React Native to connect
from flask_restx import Namespace, Resource
from app.utils import require_auth  # ✅ Import Keycloak authentication decorator

# ✅ Define the API Namespace
main_api = Namespace("api", description="API Endpoints")  # ✅ Corrected

# ✅ Enable CORS for React Native compatibility
main = Blueprint("main", __name__)
CORS(main, resources={r"/api/*": {"origins": "*"}})


# -------------------------
# 🚀 AUTHENTICATION ROUTES (Keycloak)
# -------------------------

@main_api.route("/signup")
class Signup(Resource):
    def post(self):
        """Sign up a new user (Handled by Keycloak)."""
        return {"message": "Use Keycloak for signup"}, 400


@main_api.route("/login")
class Login(Resource):
    def post(self):
        """Redirect users to Keycloak login page."""
        keycloak_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/auth"
        return {"login_url": keycloak_url}, 200

@main_api.route("/logout")
class Logout(Resource):
    @require_auth()
    def post(self):
        """Log out the current user via Keycloak."""
        token = request.headers.get("Authorization", "").split(" ")[1]
        keycloak_logout_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/logout"

        response = requests.post(
            keycloak_logout_url,
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code == 204:
            return {"message": "Logged out successfully"}, 200
        else:
            return {"message": "Logout failed"}, response.status_code


# -------------------------
# 🚀 PROFILE ROUTES
# -------------------------

@main_api.route("/profile/<int:user_id>")
class UserProfile(Resource):
    @require_auth()
    def get(self, user_id):
        """Get user profile and posts."""
        user = User.query.get_or_404(user_id)
        posts = Post.query.filter_by(user_id=user_id).all()
        return {
            "username": user.username,
            "bio": user.bio,
            "profile_pic": user.profile_pic,
            "posts": [{"content": post.content, "timestamp": post.timestamp} for post in posts]
        }, 200


@main_api.route("/update_profile")
class UpdateProfile(Resource):
    @require_auth()
    def put(self):
        """Update user profile."""
        data = request.json
        user = User.query.get_or_404(request.user["sub"])  # ✅ Get user from Keycloak token
        user.bio = data.get("bio", user.bio)
        user.profile_pic = data.get("profile_pic", user.profile_pic)
        db.session.commit()
        return {"message": "Profile updated successfully"}, 200


# -------------------------
# 🚀 FEED & POSTS ROUTES
# -------------------------

@main_api.route("/feed")
class Feed(Resource):
    @require_auth()
    def get(self):
        """Fetch posts from users the current user follows."""
        user_id = request.user["sub"]
        following = [follow.followed_id for follow in Follow.query.filter_by(follower_id=user_id).all()]
        following.append(user_id)

        posts = Post.query.filter(Post.user_id.in_(following)).order_by(Post.timestamp.desc()).all()

        return [{
            "id": post.id,
            "author": post.author.username,
            "author_pic": post.author.profile_pic,
            "content": post.content,
            "image": post.image,
            "timestamp": post.timestamp.isoformat(),
            "likes": len(post.likes),
            "comments": len(post.comments)
        } for post in posts], 200


@main_api.route("/post")
class CreatePost(Resource):
    @require_auth()
    def post(self):
        """Create a new post."""
        data = request.json
        content = data["content"]
        user_id = request.user["sub"]

        if not content:
            return {"message": "Post content cannot be empty"}, 400

        post = Post(content=content, user_id=user_id)
        db.session.add(post)
        db.session.commit()
        return {"message": "Post created successfully"}, 201


# -------------------------
# 🚀 LIKES & COMMENTS
# -------------------------

@main_api.route("/post/<int:post_id>/like")
class LikePost(Resource):
    @require_auth()
    def post(self, post_id):
        """Like or unlike a post."""
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


@main_api.route("/post/<int:post_id>/comment")
class AddComment(Resource):
    @require_auth()
    def post(self, post_id):
        """Add a comment to a post."""
        user_id = request.user["sub"]
        data = request.json
        content = data.get("content")

        if not content:
            return {"message": "Comment cannot be empty"}, 400

        comment = Comment(content=content, user_id=user_id, post_id=post_id)
        db.session.add(comment)
        db.session.commit()

        return {"message": "Comment added"}, 201


# -------------------------
# 🚀 FRIEND SYSTEM
# -------------------------

@main_api.route("/follow/<int:user_id>")
class FollowUser(Resource):
    @require_auth()
    def post(self, user_id):
        """Follow or unfollow a user."""
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


# -------------------------
# 🚀 CHAT SYSTEM
# -------------------------

@main_api.route("/send_message")
class SendMessage(Resource):
    @require_auth()
    def post(self):
        """Send a private message."""
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


@main_api.route("/get_messages/<int:receiver_id>")
class GetMessages(Resource):
    @require_auth()
    def get(self, receiver_id):
        """Get chat messages."""
        sender_id = request.user["sub"]
        messages = Chat.query.filter(
            ((Chat.sender_id == sender_id) & (Chat.receiver_id == receiver_id)) |
            ((Chat.sender_id == receiver_id) & (Chat.receiver_id == sender_id))
        ).order_by(Chat.timestamp.asc()).all()

        return [{"sender": msg.sender_id, "receiver": msg.receiver_id, "message": msg.message, "timestamp": msg.timestamp} for msg in messages], 200


# ✅ Register the API correctly
#api.add_namespace(main_namespace, path="/api")
