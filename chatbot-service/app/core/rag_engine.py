import os
import openai
from sqlalchemy import select, and_, or_
from app.models.document import Document
from app.core.database import SessionLocal
from app.utils.embeddings import embed_text
from config.sources import CRISIS_KEYWORDS, SOURCE_CATEGORIES

class RAGEngine:
    def __init__(self, model="gpt-4o-mini", top_k=5):
        self.model = model
        self.top_k = top_k
        self._openai = None
        self.system_message = (
            "You are a knowledgeable assistant for YesLove, specializing in relationship and mental health advice. "
            "Use only the provided context to answer questions. Prioritize YesLove content, then credible sources like Relate, Brook, and Mind. "
            "For crisis situations mentioning abuse or harm, immediately provide relevant helpline information. "
            "Always respond in marked down format with source attribution."
            "If unsure, direct users to www.yeslove.co.uk. Never hallucinate or provide unsupported information."
        )
    
    def setup_openai(self):
        """Setup OpenAI with API key"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set")
        
        openai.api_key = api_key

    def retrieve_context(self, query: str) -> str:
        """Retrieve relevant context with priority-based filtering"""
        try:
            is_crisis = any(keyword in query.lower() for keyword in CRISIS_KEYWORDS)
            
            with SessionLocal() as session:
                if is_crisis:
                    # Prioritize abuse support sources for crisis queries
                    stmt = select(Document.content, Document.source_name).where(
                        Document.category == "relationships.abuse-support"
                    ).limit(self.top_k)
                else:
                    # Normal priority-based retrieval
                    stmt = select(Document.content, Document.source_name).where(
                        or_(
                            Document.category == "yeslove.blogs",
                            Document.category == "relationships.core",
                            Document.category == "relationships.abuse-support"
                        )
                    ).order_by(Document.priority).limit(self.top_k)
                
                results = session.execute(stmt).all()
                
                if not results:
                    return "No relevant content found. Please visit www.yeslove.co.uk for more information."
                
                chunks = [f"{content}\n[Source: {source_name or 'YesLove'}]" 
                         for content, source_name in results]
                return "\n\n---\n\n".join(chunks)
        except Exception as e:
            print(f"Error retrieving context: {e}")
            return "I'm having trouble accessing my knowledge base. Please visit www.yeslove.co.uk for relationship advice."

    def generate_response(self, message: str, history: list = None) -> str:
        """Generate response using RAG"""
        if history is None:
            history = []
        
        try:
            # Check for OpenAI API key
            api_key = os.getenv("OPENAI_API_KEY")
            print(f"API Key present: {bool(api_key)}")
            if not api_key:
                return "I'm currently unavailable. Please visit www.yeslove.co.uk for relationship advice."
            
            context = self.retrieve_context(message)
            print(f"Context retrieved: {len(context)} characters")
            
            enhanced_message = f"{message}\n\nContext:\n{context}"
            
            messages = [{"role": "system", "content": self.system_message}]
            
            # Add history messages with proper role format
            for msg in history:
                if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                    messages.append(msg)
            
            messages.append({"role": "user", "content": enhanced_message})
            
            print(f"Calling OpenAI with model: {self.model}")
            self.setup_openai()
            
            # Use OpenAI 0.28 API
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages
            )
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating response: {e}")
            print(f"Error type: {type(e)}")
            return "I'm having technical difficulties. Please visit www.yeslove.co.uk for relationship advice and support."