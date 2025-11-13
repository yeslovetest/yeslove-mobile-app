"""External source sync API endpoints"""
from flask import Blueprint, request, jsonify
from app.services.external_sync_service import ExternalSyncService

external_sync_bp = Blueprint('external_sync', __name__)

@external_sync_bp.route('/api/v1/sync/external', methods=['POST'])
def sync_external_source():
    """Sync content from external URL"""
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({"error": "URL required"}), 400
    
    url = data['url']
    sync_service = ExternalSyncService()
    result = sync_service.sync_external_url(url)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result)

@external_sync_bp.route('/api/v1/sync/external/batch', methods=['POST'])
def sync_external_batch():
    """Sync multiple external URLs"""
    data = request.get_json()
    
    if not data or 'urls' not in data:
        return jsonify({"error": "URLs array required"}), 400
    
    urls = data['urls']
    sync_service = ExternalSyncService()
    results = []
    
    for url in urls:
        result = sync_service.sync_external_url(url)
        results.append({"url": url, **result})
    
    return jsonify({"results": results})