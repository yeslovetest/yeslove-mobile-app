"""External source synchronization service"""
import json
import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from app.models.document import Document
from app.core.database import SessionLocal
from app.utils.embeddings import embed_text
from app.utils.text_processing import chunk_text
from app.utils.source_validator import is_url_allowed, get_source_priority

class ExternalSyncService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def sync_external_url(self, url: str) -> dict:
        """Sync content from external URL if allowed"""
        allowed, category, source_name = is_url_allowed(url)
        
        if not allowed:
            return {"error": f"URL not in allowed sources: {url}"}
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            content = self._extract_content(response.text, url)
            if not content:
                return {"error": "No content extracted"}
            
            return self._process_external_content(url, content, category, source_name)
            
        except Exception as e:
            return {"error": f"Failed to sync {url}: {str(e)}"}

    def _extract_content(self, html: str, url: str) -> str:
        """Extract main content from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
        
        # Try to find main content area
        main_content = (
            soup.find('main') or 
            soup.find('article') or 
            soup.find('div', class_=['content', 'main-content', 'article-content']) or
            soup.find('body')
        )
        
        if main_content:
            # Extract text and clean up
            text = main_content.get_text(separator=' ', strip=True)
            # Remove excessive whitespace
            text = ' '.join(text.split())
            return text
        
        return ""

    def _process_external_content(self, url: str, content: str, category: str, source_name: str) -> dict:
        """Process external content into document chunks"""
        with SessionLocal() as session:
            try:
                # Remove existing content from this URL
                session.query(Document).filter(Document.source == url).delete()
                
                chunks = chunk_text(content)
                priority = get_source_priority(category)
                
                metadata = {
                    "url": url,
                    "source_name": source_name,
                    "category": category,
                    "type": "external_content"
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
                    "source_name": source_name
                }
                
            except Exception as e:
                session.rollback()
                raise e