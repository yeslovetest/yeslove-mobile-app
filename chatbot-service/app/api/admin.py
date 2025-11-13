"""Admin API for content management"""
from flask import Blueprint, request, jsonify
from flask_restx import Namespace, Resource, fields
from app.services.external_sync_service import ExternalSyncService
from app.services.auto_sync_service import AutoSyncService

admin_bp = Blueprint('admin', __name__)
api = Namespace('admin', description='Administrative Operations')

sync_response = api.model('SyncResponse', {
    'status': fields.String(description='Operation status', example='sync_triggered')
})
auto_sync = AutoSyncService()

@api.route('/sync/trigger')
class TriggerSync(Resource):
    @api.marshal_with(sync_response)
    @api.doc(responses={200: 'Success', 500: 'Internal Server Error'})
    def post(self):
        """Manually trigger content sync from all external sources
        
        Syncs content from:
        • 23 approved relationship advice sources
        • RSS feeds from partner organizations
        • Configured external URLs
        """
        try:
            auto_sync.sync_all_sources()
            return {"status": "sync_triggered"}
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500

@api.route('/sync/start')
class StartAutoSync(Resource):
    @api.marshal_with(sync_response)
    def post(self):
        """Start automated sync scheduler (daily at 2 AM)"""
        auto_sync.start_scheduler()
        return {"status": "auto_sync_started"}

@api.route('/sync/stop')
class StopAutoSync(Resource):
    @api.marshal_with(sync_response)
    def post(self):
        """Stop automated sync scheduler"""
        auto_sync.stop()
        return {"status": "auto_sync_stopped"}