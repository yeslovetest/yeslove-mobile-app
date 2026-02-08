from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from app.services.sync_service import SyncService

api = Namespace("sync", description="Data Sync API")

post_sync_request = api.model('PostSyncRequest', {
    'posts': fields.List(fields.Raw, required=True, description='List of posts to sync'),
    'action': fields.String(description='Action: create, update, delete')
})

sync_response = api.model('SyncResponse', {
    'processed': fields.Integer(description='Number of items processed'),
    'errors': fields.List(fields.String, description='List of errors'),
    'total': fields.Integer(description='Total items received')
})

sync_service = SyncService()

@api.route('/blogs')
class SyncBlogs(Resource):
    @api.expect(post_sync_request)
    @api.marshal_with(sync_response)
    def post(self):
        """Sync blog posts from main application"""
        data = request.json
        blogs = data.get('posts', [])  # Reuse same structure
        
        result = sync_service.sync_blog_posts(blogs)
        return result