from flask import Blueprint, request, jsonify, current_app
import requests
from app.models import User, Post, Comment, Follow, Like, Chat, db
from flask_cors import CORS  # ✅ Allow React Native to connect
from flask_restx import Namespace, Resource
from app.utils import require_auth  # ✅ Import Keycloak authentication utilities

# ✅ Define the API Namespace
main_api = Namespace("api", description="API Endpoints")

# ✅ Enable CORS for React Native compatibility
main = Blueprint("main", __name__)
CORS(main, resources={r"/api/*": {"origins": "*"}})


# -------------------------
# 🚀 AUTHENTICATION ROUTES (Keycloak)
# -------------------------

@main_api.route("/signup")
class Signup(Resource):
    def post(self):
        """Keycloak handles user registration."""
        return {"message": "User signup is handled by Keycloak"}, 400


# -------------------------
# 🚀 AUTHENTICATION ROUTES (Keycloak)
# -------------------------
 
@main_api.route("/login")
class Login(Resource):
    def post(self):
        """Exchange user credentials for a Keycloak access token."""
        from app.utils import verify_jwt  # ✅ Move the import here to avoid circular import
        data = request.json
        username = data.get("charlesj")
        password = data.get("Password@90")


        if not username or not password:
            return {"message": "Username and password are required"}, 400

        keycloak_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/token"
        payload = {
            "grant_type": "password",
            "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
            "client_secret": current_app.config["KEYCLOAK_CLIENT_SECRET"],
            "username": username,
            "password": password
        }

        response = requests.post(keycloak_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})

        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")

            # ✅ Decode token to get user info
            user_info = verify_jwt(access_token)
            if not user_info:
                return {"message": "Invalid token received from Keycloak"}, 401

            # ✅ Ensure user exists in local DB
            existing_user = User.query.filter_by(keycloak_id=user_info["sub"]).first()
            if not existing_user:
                print("🔹 Creating new user in database...")
                new_user = User(
                    keycloak_id=user_info["sub"],
                    username=user_info.get("preferred_username", username),
                    email=user_info.get("email", "")
                )
                db.session.add(new_user)
                db.session.commit()

                print(f"✅ User {new_user.username} created with Keycloak ID {new_user.keycloak_id}")

            return token_data, 200  # ✅ Return the token

        return {"message": "Invalid login credentials"}, response.status_code


@main_api.route("/logout")
class Logout(Resource):
    @require_auth()
    def post(self):
        """Logout user from Keycloak."""
        token = request.headers.get("Authorization").split(" ")[1]
        keycloak_logout_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/logout"

        response = requests.post(
            keycloak_logout_url,
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code == 204:
            return {"message": "Logged out successfully"}, 200
        return {"message": "Logout failed"}, response.status_code


# -------------------------
# 🚀 PROFILE ROUTES
# -------------------------

@main_api.route("/profile/<string:keycloak_id>")
class UserProfile(Resource):
    @require_auth()
    def get(self, keycloak_id):
        """Get user profile and posts."""
        user = User.query.filter_by(keycloak_id=keycloak_id).first()

        if not user:
            return {"message": "User not found"}, 404  # ✅ Always return a JSON object

        response_data = {
            "username": user.username,
            "bio": user.bio,
            "profile_pic": user.profile_pic,
            "posts": [
                {
                    "content": post.content,
                    "timestamp": post.timestamp.isoformat() if post.timestamp else None
                } for post in user.posts
            ]
        }

        return response_data, 200  # ✅ Correctly formatted response



@main_api.route("/update_profile")
class UpdateProfile(Resource):
    @require_auth()
    def put(self):
        """Update user profile."""
        data = request.json
        user = User.query.filter_by(email=request.user["email"]).first()

        if not user:
            return {"message": "User not found"}, 404

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
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()  # ✅ Use Keycloak UUID
        if not user:
            return {"message": "User not found"}, 404

        following = [follow.followed_id for follow in user.following]
        following.append(user.id)

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
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()  # ✅ Use Keycloak UUID
        if not user:
            return {"message": "User not found"}, 404

        if not data.get("content"):
            return {"message": "Post content cannot be empty"}, 400

        post = Post(content=data["content"], user_id=user.id)
        db.session.add(post)
        db.session.commit()
        return {"message": "Post created successfully"}, 201


# -------------------------
# 🚀 FRIEND SYSTEM
# -------------------------

@main_api.route("/follow/<int:user_id>")
class FollowUser(Resource):
    @require_auth()
    def post(self, user_id):
        """Follow or unfollow a user."""
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()  # ✅ Use Keycloak UUID
        target_user = User.query.get(user_id)

        if not user or not target_user:
            return {"message": "User not found"}, 404

        existing_follow = Follow.query.filter_by(follower_id=user.id, followed_id=user_id).first()

        if existing_follow:
            db.session.delete(existing_follow)
            db.session.commit()
            return {"message": "Unfollowed successfully"}

        new_follow = Follow(follower_id=user.id, followed_id=user_id)
        db.session.add(new_follow)
        db.session.commit()
        return {"message": "Followed successfully"}
    
    # -------------------------
# 🚀 LIKE ROUTES
# -------------------------

@main_api.route("/post/<int:post_id>/like")
class LikePost(Resource):
    @require_auth()
    def post(self, post_id):
        """Like or unlike a post."""
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        existing_like = Like.query.filter_by(user_id=user.id, post_id=post_id).first()

        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return {"message": "Like removed"}, 200

        new_like = Like(user_id=user.id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        return {"message": "Post liked"}, 201


# -------------------------
# 🚀 COMMENT ROUTES
# -------------------------

@main_api.route("/post/<int:post_id>/comment")
class AddComment(Resource):
    @require_auth()
    def post(self, post_id):
        """Add a comment to a post."""
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


@main_api.route("/post/<int:post_id>/comments")
class GetComments(Resource):
    def get(self, post_id):
        """Fetch all comments for a post."""
        comments = Comment.query.filter_by(post_id=post_id).all()
        return [
            {
                "id": comment.id,
                "content": comment.content,
                "author": comment.user.username,
                "timestamp": comment.timestamp.isoformat() if comment.timestamp else None,
            }
            for comment in comments
        ], 200


# -------------------------
# 🚀 FOLLOW ROUTES
# -------------------------

@main_api.route("/follow/<int:user_id>")
class FollowUser(Resource):
    @require_auth()
    def post(self, user_id):
        """Follow or unfollow a user."""
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


@main_api.route("/followers/<int:user_id>")
class GetFollowers(Resource):
    def get(self, user_id):
        """Fetch all followers of a user."""
        followers = Follow.query.filter_by(followed_id=user_id).all()
        return [
            {"id": follow.follower_id, "username": follow.follower.username}
            for follow in followers
        ], 200


@main_api.route("/following/<int:user_id>")
class GetFollowing(Resource):
    def get(self, user_id):
        """Fetch all users the current user is following."""
        following = Follow.query.filter_by(follower_id=user_id).all()
        return [
            {"id": follow.followed_id, "username": follow.followed.username}
            for follow in following
        ], 200


# -------------------------
# 🚀 CHAT ROUTES
# -------------------------

@main_api.route("/send_message")
class SendMessage(Resource):
    @require_auth()
    def post(self):
        """Send a private message."""
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        data = request.json
        receiver_id = data.get("receiver_id")
        message = data.get("message")

        if not message or not receiver_id:
            return {"message": "Message and receiver ID are required"}, 400

        if user.id == receiver_id:
            return {"message": "You cannot message yourself"}, 400

        receiver = User.query.get(receiver_id)
        if not receiver:
            return {"message": "Receiver not found"}, 404

        new_message = Chat(sender_id=user.id, receiver_id=receiver_id, message=message)
        db.session.add(new_message)
        db.session.commit()
        return {"message": "Message sent successfully"}, 201


@main_api.route("/get_messages/<int:receiver_id>")
class GetMessages(Resource):
    @require_auth()
    def get(self, receiver_id):
        """Fetch chat messages between two users."""
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        messages = Chat.query.filter(
            ((Chat.sender_id == user.id) & (Chat.receiver_id == receiver_id))
            | ((Chat.sender_id == receiver_id) & (Chat.receiver_id == user.id))
        ).order_by(Chat.timestamp.asc()).all()

        return [
            {
                "sender": msg.sender.username,
                "receiver": msg.receiver.username,
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
            }
            for msg in messages
        ], 200

# ✅ Register the API correctly
#api.add_namespace(main_namespace, path="/api")
    # Create the main API instance
#api = Api(title="YesLove API", version="1.0", description="YesLove API")

# Register the Namespace
#api.add_namespace(main_api, path="/api")  # ✅ Register the main_api namespace here
