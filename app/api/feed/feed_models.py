from .feed_routes import api
from flask_restx import fields

FeedQuery = api.model("FeedQuery", {
        "feed_type": fields.String(
            required=False, 
            description="Type of feed: 'all', 'mentions', 'favorites', 'friends', 'groups'"
        )
    })

Post = api.model('Post', {
    'id': fields.Integer(description='Post ID'),
    'author': fields.String(description='Username of the author'),
    'author_pic': fields.String(description='URL to author\'s profile picture'),
    'content': fields.String(description='Text content of the post'),
    'image': fields.String(description='URL to image in the post'),
    'timestamp': fields.String(description='Timestamp of the post in ISO format'),
    'likes': fields.Integer(description='Number of likes'),
    'comments': fields.Integer(description='Number of comments')
})

FeedResponse = api.model('PostResponse', {'posts': fields.List(fields.Nested(Post))})

CreatePostRequest= api.model("CreatePostRequest", {
        "content": fields.String(required=True, description="Content of the post"),
    })

LikePostRequest = api.model("LikePostRequest", {
        "post_id": fields.Integer(required=True, description="ID of the post to like or unlike"),
    })

AddCommentRequest = api.model("AddCommentRequest", {
        "content": fields.String(required=True, description="Content of the comment"),
    })

FollowUserRequest = api.model("FollowUserRequest", {
        "action": fields.String(required=True, description="'follow' to follow, 'unfollow' to unfollow")
    })


ReactionRequest = api.model("ReactionRequest", {
        "reaction_type": fields.String(
            required=True,
            description="Reaction type: 'like', 'love', 'laugh', 'angry', etc."
        )
    })

GetProfileRequest = api.model("GetProfileRequest", {})

GetFollowersRequest = api.model("GetFollowersRequest", {})

GetFollowingRequest = api.model("GetFollowingRequest", {})
