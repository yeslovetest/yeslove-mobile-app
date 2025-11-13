"""MCP-based content synchronization service"""
import json
from typing import List, Dict
from app.models.document import Document
from app.core.database import SessionLocal
from app.utils.embeddings import embed_text
from app.utils.text_processing import chunk_text

class MCPSyncService:
    """Model Context Protocol integration for dynamic content sync"""
    
    def __init__(self):
        self.content_sources = {}
    
    def register_content_source(self, source_id: str, content_provider):
        """Register a dynamic content source via MCP"""
        self.content_sources[source_id] = content_provider
    
    def sync_from_mcp_source(self, source_id: str, content_data: Dict) -> Dict:
        """Sync content from MCP source"""
        try:
            content = content_data.get('content', '')
            category = content_data.get('category', 'relationships.core')
            source_name = content_data.get('source_name', 'External')
            url = content_data.get('url', f'mcp://{source_id}')
            
            return self._process_mcp_content(url, content, category, source_name)
            
        except Exception as e:
            return {"error": f"MCP sync failed: {str(e)}"}
    
    def _process_mcp_content(self, url: str, content: str, category: str, source_name: str) -> Dict:
        """Process MCP content into document chunks"""
        with SessionLocal() as session:
            try:
                # Remove existing content
                session.query(Document).filter(Document.source == url).delete()
                
                chunks = chunk_text(content)
                priority = self._get_priority(category)
                
                metadata = {
                    "url": url,
                    "source_name": source_name,
                    "category": category,
                    "type": "mcp_content",
                    "sync_method": "mcp"
                }
                
                for idx, chunk in enumerate(chunks):
                    embedding = embed_text(chunk)
                    
                    doc = Document(
                        source=url,
                        chunk_index=idx,
                        content=chunk,
                        embedding=json.dumps(embedding),
                        doc_metadata=json.dumps(metadata),
                        category=category,
                        source_name=source_name,
                        priority=priority
                    )
                    session.add(doc)
                
                session.commit()
                
                return {
                    "success": True,
                    "chunks_created": len(chunks),
                    "category": category,
                    "source_name": source_name,
                    "sync_method": "mcp"
                }
                
            except Exception as e:
                session.rollback()
                raise e
    
    def _get_priority(self, category: str) -> int:
        """Get priority based on category"""
        priority_map = {
            "yeslove.blogs": 1,
            "relationships.core": 2,
            "relationships.abuse-support": 2,
            "youth.rse": 3,
            "context.mental-health": 4,
            "context.cultural": 4,
            "relationships.contextual": 5
        }
        return priority_map.get(category, 5)