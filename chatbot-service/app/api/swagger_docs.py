"""Enhanced Swagger documentation for all endpoints"""
from flask_restx import Namespace, Resource, fields

# Webhook API
webhook_api = Namespace("webhook", description="Webhook Content Integration")

webhook_content_model = webhook_api.model('WebhookContent', {
    'content': fields.String(required=True, description='Content text', 
                           example='Healthy relationships require trust, communication, and mutual respect.'),
    'source_name': fields.String(required=True, description='Source name', example='Relate'),
    'category': fields.String(required=True, description='Content category', 
                            example='relationships.core',
                            enum=['yeslove.blogs', 'relationships.core', 'relationships.abuse-support', 
                                 'youth.rse', 'context.mental-health', 'context.cultural', 'relationships.contextual']),
    'url': fields.String(description='Source URL', example='https://www.relate.org.uk/get-help/')
})

webhook_response_model = webhook_api.model('WebhookResponse', {
    'success': fields.Boolean(description='Operation success'),
    'chunks_created': fields.Integer(description='Number of content chunks created'),
    'category': fields.String(description='Assigned category'),
    'source_name': fields.String(description='Source name')
})

# Admin API
admin_api = Namespace("admin", description="Administrative Operations")

sync_response_model = admin_api.model('SyncResponse', {
    'status': fields.String(description='Sync status', example='sync_triggered'),
    'message': fields.String(description='Status message')
})

# Health API
health_api = Namespace("health", description="Service Health Monitoring")

health_response_model = health_api.model('HealthResponse', {
    'status': fields.String(description='Service status', example='healthy'),
    'version': fields.String(description='Service version', example='1.0.0'),
    'database': fields.String(description='Database status', example='connected'),
    'openai': fields.String(description='OpenAI API status', example='available'),
    'sync_methods': fields.List(fields.String, description='Available sync methods')
})

# External Sync API
external_sync_api = Namespace("external-sync", description="External Source Synchronization")

external_sync_model = external_sync_api.model('ExternalSyncRequest', {
    'url': fields.String(required=True, description='URL to sync', 
                        example='https://www.relate.org.uk/get-help/relationship-help/')
})

external_sync_response_model = external_sync_api.model('ExternalSyncResponse', {
    'success': fields.Boolean(description='Sync success'),
    'chunks_created': fields.Integer(description='Content chunks created'),
    'category': fields.String(description='Source category'),
    'source_name': fields.String(description='Source name'),
    'error': fields.String(description='Error message if failed')
})