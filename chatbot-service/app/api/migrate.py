from flask import request
from flask_restx import Namespace, Resource, fields
from app.models.document import Document
from app.core.database import SessionLocal

api = Namespace("migrate", description="Migration API")

migrate_request = api.model('MigrateRequest', {
    'documents': fields.List(fields.Raw, required=True, description='List of documents to migrate')
})

@api.route('/documents')
class MigrateDocuments(Resource):
    @api.expect(migrate_request)
    def post(self):
        """Migrate documents from main app to chatbot service"""
        data = request.json
        documents = data.get('documents', [])
        
        migrated = 0
        errors = []
        
        with SessionLocal() as session:
            try:
                for doc_data in documents:
                    try:
                        doc = Document(
                            source=doc_data['source'],
                            chunk_index=doc_data['chunk_index'],
                            content=doc_data['content'],
                            embedding=doc_data['embedding'],
                            doc_metadata=doc_data.get('metadata')
                        )
                        session.add(doc)
                        migrated += 1
                    except Exception as e:
                        errors.append(f"Document {doc_data.get('source', 'unknown')}: {str(e)}")
                
                session.commit()
                
            except Exception as e:
                session.rollback()
                return {"error": f"Migration failed: {str(e)}"}, 500
        
        return {
            "migrated": migrated,
            "errors": errors,
            "total": len(documents)
        }