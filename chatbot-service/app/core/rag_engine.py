import os
import openai
import json
import math
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

    def _cosine_similarity(self, left, right) -> float:
        if not left or not right:
            return 0.0
        denominator = math.sqrt(sum(x * x for x in left)) * math.sqrt(sum(y * y for y in right))
        if denominator == 0:
            return 0.0
        return sum(x * y for x, y in zip(left, right)) / denominator

    def retrieve_documents(self, query: str):
        """Retrieve relevant documents with priority and embedding similarity."""
        try:
            is_crisis = any(keyword in query.lower() for keyword in CRISIS_KEYWORDS)
            query_embedding = embed_text(query)
            
            with SessionLocal() as session:
                if is_crisis:
                    # Prioritize abuse support sources for crisis queries
                    stmt = select(Document).where(
                        Document.category == "relationships.abuse-support"
                    )
                else:
                    # Normal priority-based retrieval
                    stmt = select(Document).where(
                        or_(
                            Document.category == "yeslove.blogs",
                            Document.category == "yeslove.video-podcasts",
                            Document.category == "relationships.core",
                            Document.category == "relationships.abuse-support"
                        )
                    )
                
                documents = session.execute(stmt).scalars().all()
                scored = []
                for doc in documents:
                    try:
                        embedding = json.loads(doc.embedding)
                        similarity = self._cosine_similarity(query_embedding, embedding)
                    except Exception:
                        similarity = 0.0
                    priority = doc.priority or 99
                    scored.append((priority, -similarity, doc))

                scored.sort(key=lambda item: (item[0], item[1]))
                return [doc for _, _, doc in scored[:self.top_k]]
        except Exception as e:
            print(f"Error retrieving context: {e}")
            return []

    def retrieve_context(self, query: str) -> str:
        """Retrieve relevant context with priority-based filtering"""
        documents = self.retrieve_documents(query)
        if not documents:
            return "I'm having trouble accessing my knowledge base. Please visit www.yeslove.co.uk for relationship advice."

        chunks = [
            f"{doc.content}\n[Source: {doc.source_name or 'YesLove'}]"
            for doc in documents
        ]
        return "\n\n---\n\n".join(chunks)

    def retrieve_recommendations(self, query: str, limit: int = 3) -> list:
        """Return unique linkable content recommendations relevant to the query."""
        recommendations = []
        seen = set()

        for doc in self.retrieve_documents(query):
            if not doc.doc_metadata:
                continue
            try:
                metadata = json.loads(doc.doc_metadata)
            except json.JSONDecodeError:
                continue

            resource_type = metadata.get("type")
            url = metadata.get("url")
            title = metadata.get("title")
            if resource_type not in {"blog", "blog_post", "video_podcast"} or not url or not title:
                continue

            resource_id = metadata.get("resource_id") or f"{resource_type}:{metadata.get('source_id') or doc.source}"
            if resource_id in seen:
                continue
            seen.add(resource_id)

            recommendations.append({
                "type": "blog" if resource_type == "blog_post" else resource_type,
                "title": title,
                "url": url,
                "summary": metadata.get("summary"),
                "image_url": metadata.get("image_url"),
                "thumbnail_url": metadata.get("thumbnail_url"),
                "video_url": metadata.get("video_url"),
                "reason": "Relevant to your question based on YesLove content.",
            })

            if len(recommendations) >= limit:
                break

        return recommendations

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

    def generate_response_with_recommendations(self, message: str, history: list = None) -> dict:
        """Generate conversational response plus optional content recommendations."""
        answer = self.generate_response(message, history)
        return {
            "answer": answer,
            "recommendations": self.retrieve_recommendations(message),
        }
