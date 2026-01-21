"""Webhook-based content synchronization"""
from flask import Blueprint, request, jsonify
import json
from app.services.mcp_sync_service import MCPSyncService

webhook_bp = Blueprint('webhook', __name__)
mcp_sync = MCPSyncService()

@webhook_bp.route('/api/v1/webhook/content', methods=['POST'])
def receive_content():
    """Receive content via webhook from any source"""
    data = request.get_json()
    
    required_fields = ['content', 'source_name', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    result = mcp_sync.sync_from_mcp_source('webhook', data)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result)

@webhook_bp.route('/api/v1/webhook/blog', methods=['POST'])
def receive_blog():
    """Receive blog content from main YesLove app"""
    data = request.get_json()
    
    # Transform blog data to standard format
    content_data = {
        'content': f"{data.get('title', '')}\n\n{data.get('content', '')}",
        'source_name': 'YesLove',
        'category': 'yeslove.blogs',
        'url': f"blog_{data.get('id')}"
    }
    
    result = mcp_sync.sync_from_mcp_source('blog', content_data)
    return jsonify(result)