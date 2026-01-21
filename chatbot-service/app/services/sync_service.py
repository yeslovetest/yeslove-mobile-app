import json
from sqlalchemy.orm import Session
from app.models.document import Document
from app.core.database import SessionLocal
from app.utils.embeddings import embed_text
from app.utils.text_processing import chunk_text
from app.utils.source_validator import is_url_allowed, get_source_priority
from config.sources import SOURCE_CATEGORIES

class SyncService:
    def __init__(self):
        pass



    def sync_blog_posts(self, blog_posts: list) -> dict:
        """Sync blog posts from main app"""
        processed = 0
        errors = []
        
        with SessionLocal() as session:
            try:
                for blog_data in blog_posts:
                    try:
                        self._process_blog_post(session, blog_data)
                        processed += 1
                    except Exception as e:
                        errors.append(f"Blog {blog_data.get('id')}: {str(e)}")
                
                session.commit()
                
            except Exception as e:
                session.rollback()
                raise e
        
        return {
            "processed": processed,
            "errors": errors,
            "total": len(blog_posts)
        }

    def _process_blog_post(self, session: Session, blog_data: dict):
        """Process blog post into document chunks"""
        content = f"{blog_data.get('title', '')}\n\n{blog_data.get('content', '')}"
        blog_id = blog_data.get('id')
        author = blog_data.get('author', 'YesLove')
        
        metadata = {
            "blog_id": blog_id,
            "author": author,
            "type": "blog_post",
            "title": blog_data.get('title', '')
        }
        
        chunks = chunk_text(content)
        
        # Remove existing chunks
        session.query(Document).filter(
            Document.source == f"blog_{blog_id}"
        ).delete()
        
        # Add new chunks
        for idx, chunk in enumerate(chunks):
            embedding = embed_text(chunk)
            
            doc = Document(
                source=f"blog_{blog_id}",
                chunk_index=idx,
                content=chunk,
                embedding=json.dumps(embedding),
                doc_metadata=json.dumps(metadata),
                category="yeslove.blogs",
                source_name="YesLove",
                priority=1
            )
            session.add(doc)