from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
import requests
from app.services.sync_service import SyncService

api = Namespace("sync", description="Data Sync API")

post_sync_request = api.model('PostSyncRequest', {
    'posts': fields.List(fields.Raw, required=True, description='List of posts to sync'),
    'action': fields.String(description='Action: create, update, delete')
})

content_sync_request = api.model('ContentSyncRequest', {
    'resources': fields.List(fields.Raw, required=True, description='Recommendable content resources to sync'),
    'action': fields.String(description='Action: upsert, create, update, delete')
})

wordpress_sync_request = api.model('WordPressSyncRequest', {
    'page': fields.Integer(description='WordPress page to sync', default=1),
    'per_page': fields.Integer(description='WordPress posts per page', default=25)
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


@api.route('/wordpress-blogs')
class SyncWordPressBlogs(Resource):
    @api.expect(wordpress_sync_request)
    @api.marshal_with(sync_response)
    def post(self):
        """Fetch and sync blog posts from WordPress"""
        data = request.json or {}
        page = max(int(data.get('page', 1)), 1)
        per_page = max(1, min(int(data.get('per_page', 25)), 100))

        try:
            result = sync_service.sync_wordpress_blog_posts(page=page, per_page=per_page)
            return result
        except requests.RequestException as exc:
            return {
                "processed": 0,
                "errors": [f"WordPress sync failed: {str(exc)}"],
                "total": 0,
            }, 502


@api.route('/content')
class SyncContent(Resource):
    @api.expect(content_sync_request)
    @api.marshal_with(sync_response)
    def post(self):
        """Sync generic recommendable content resources from main application"""
        data = request.json or {}
        resources = data.get('resources', [])

        result = sync_service.sync_content_resources(resources)
        return result
