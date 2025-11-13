from .feed_routes import api
from flask_restx import fields

FeedQuery = api.model("FeedQuery", {
        "feed_type": fields.String(
            required=False, 
            description="Type of feed: 'all', 'mentions', 'favorites', 'friends', 'groups'"
        )
    })

MediaFile = api.model("MediaFile", {
        "uri": fields.String(description="URL of the media file"),
        "type": fields.String(description="Type of the media file: 'image', 'video', etc.")
})

Post = api.model('Post', {
    'id': fields.Integer(description='Post ID'),
    'author': fields.String(description='Username of the author'),
    'author_id': fields.String(description='The Keycloak-ID of the author'),
    'author_pic': fields.String(description='URL to author\'s profile picture'),
    'content': fields.String(description='Text content of the post'),
    'image': fields.String(description='URL to image in the post'),
    'video_url': fields.String(description='URL to video in the post'),
    'timestamp': fields.String(description='Timestamp of the post in ISO format'),
    'likes': fields.Integer(description='Number of likes'),
    'comments': fields.Integer(description='Number of comments'),
    'media_files': fields.List(fields.Nested(MediaFile), description='List of media file URLs associated with the post'),
    'current_user_reaction': fields.String(description="Current user's reaction to the post, if any"),  
})

FeedResponse = api.model('PostResponse', {'posts': fields.List(fields.Nested(Post), description='List of posts'),
    'pagination': fields.Nested(api.model('Pagination', {
        "page": fields.Integer(description="Current page number"),  
        "per_page": fields.Integer(description="Number of posts per page"),
        "total_posts": fields.Integer(description="Total number of posts"),
        "total_pages": fields.Integer(description="Total number of pages"),
        "has_next": fields.Boolean(description="Is there a next page?"),
        "has_prev": fields.Boolean(description="Is there a previous page?")
    }))
})

CreatePostRequest = api.model("CreatePostRequest", {
    "content": fields.String(required=True, description="Content of the post"),
    "image": fields.Raw(required=False, description="Image file to upload")
})

LikePostRequest = api.model("LikePostRequest", {
        "post_id": fields.Integer(required=True, description="ID of the post to like or unlike"),
    })

AddCommentRequest = api.model("AddCommentRequest", {
        "content": fields.String(required=True, description="Content of the comment"),
    })

Comment = api.model("Comment", {
        "id": fields.Integer(description="ID of the comment"),
        "author": fields.String(description="Username of the comment's author"),        
        "content": fields.String(description="Content of the comment"),
        "timestamp": fields.String(description="Timestamp of the comment in ISO format")})

GetCommentResponse = api.model("GetCommentResponse", {
        "comments": fields.List(fields.Nested(Comment))
})

FollowUserRequest = api.model("FollowUserRequest", {
        "action": fields.String(required=True, description="'follow' to follow, 'unfollow' to unfollow"),
        "follow_type": fields.String(required=False, description="Basic follow or follow as a friend")
    })


ReactionRequest = api.model("ReactionRequest", {
        "reaction_type": fields.String(
            required=True,
            description="Reaction type: 'like', 'love', 'laugh', 'angry', etc."
        )
    })

Reaction = api.model("ReactionResponse", {
        "id": fields.Integer(description="ID of the post"),
        "type": fields.String(description="Type of reaction"),
        "author": fields.String(description="Username of the reaction's author"),
        "picture": fields.String(description="URL to the author's profile picture")
    })

GetReactionsResponse = api.model("GetReactionsResponse", {
        "reactions": fields.List(fields.Nested(Reaction))})

ReactToPostResponse = api.model("ReactToPostResponse", {
        "message": fields.String(description="Result message")
    })

GetProfileRequest = api.model("GetProfileRequest", {})

GetFollowersRequest = api.model("GetFollowersRequest", {})

GetFollowingRequest = api.model("GetFollowingRequest", {})

Follower = api.model("Follower", {
        "id": fields.String(description="ID of the follower"),
        "username": fields.String(description="Username of the follower")})

GetFollowersResponse = api.model("GetFollowersResponse", {
        "followers": fields.List(fields.Nested(Follower))})

FollowedUser = api.model("FollowedUser", {
        "id": fields.String(description="Keycloak_ID of the followed user"), 
        "username": fields.String(description="Username of the followed user"),
        "follow_type": fields.String(description="Type of follow relationship: 'basic' or 'friend'"),
        "profile_pic": fields.String(description="URL to the followed user's profile picture")})

GetFollowingResponse = api.model("GetFollowingResponse", {
        "following": fields.List(fields.Nested(FollowedUser))})
