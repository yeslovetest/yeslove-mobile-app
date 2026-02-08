"""Test sync with mock content"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from app.models.document import Document
from app.core.database import SessionLocal
from app.utils.embeddings import embed_text
from app.utils.text_processing import chunk_text

# Mock external content for testing
MOCK_CONTENT = {
    "relate_advice": {
        "content": "Healthy relationships are built on trust, communication, and mutual respect. When conflicts arise, it's important to listen actively, express your feelings clearly, and work together to find solutions. Remember that disagreements are normal in any relationship.",
        "category": "relationships.core",
        "source_name": "Relate",
        "url": "https://www.relate.org.uk/relationship-help/"
    },
    "brook_consent": {
        "content": "Consent means agreeing to something freely and willingly. In relationships, consent is ongoing and can be withdrawn at any time. Both partners should feel comfortable communicating their boundaries and respecting each other's decisions.",
        "category": "relationships.core", 
        "source_name": "Brook",
        "url": "https://www.brook.org.uk/topics/consent/"
    },
    "womens_aid": {
        "content": "Domestic abuse is a pattern of controlling behavior that can include physical, emotional, sexual, or financial abuse. If you're experiencing abuse, remember that it's not your fault and help is available. Contact the National Domestic Violence Helpline on 0808 2000 247.",
        "category": "relationships.abuse-support",
        "source_name": "Women's Aid", 
        "url": "https://www.womensaid.org.uk/information-support/"
    }
}

def add_mock_content():
    """Add mock external content for testing"""
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        print("Please set your OpenAI API key in .env file or environment")
        return
    
    print("Adding mock external content...")
    
    with SessionLocal() as session:
        for key, data in MOCK_CONTENT.items():
            chunks = chunk_text(data["content"])
            
            for idx, chunk in enumerate(chunks):
                embedding = embed_text(chunk)
                
                doc = Document(
                    source=data["url"],
                    chunk_index=idx,
                    content=chunk,
                    embedding=json.dumps(embedding),
                    doc_metadata=json.dumps({"type": "external_content"}),
                    category=data["category"],
                    source_name=data["source_name"],
                    priority=2 if "abuse-support" in data["category"] else 2
                )
                session.add(doc)
            
            print(f"✅ Added {len(chunks)} chunks from {data['source_name']}")
        
        session.commit()
    
    print("Mock content added successfully!")

if __name__ == "__main__":
    add_mock_content()