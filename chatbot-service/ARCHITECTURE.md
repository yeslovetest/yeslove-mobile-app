# YesLove Chatbot Service Architecture

## 🏗 **System Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                    YesLove Chatbot Microservice                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   API Layer │  │ Core Engine │  │   Services  │  │ Storage │ │
│  │             │  │             │  │             │  │         │ │
│  │ • Chat      │  │ • RAG       │  │ • Sync      │  │ • SQLite│ │
│  │ • Sync      │  │ • Embeddings│  │ • Text Proc │  │ • Vector│ │
│  │ • Health    │  │ • OpenAI    │  │ • Migration │  │ • Docs  │ │
│  │ • Migrate   │  │             │  │             │  │         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 **Directory Structure**

```
chatbot-service/
├── main.py                     # Flask app entry point
├── requirements.txt            # Dependencies
├── .env                       # Environment variables
├── Dockerfile                 # Container configuration
├── README.md                  # Service documentation
├── knowledge_base/            # Static knowledge files
│   ├── blogs/                # Relationship advice articles
│   ├── company/              # About us, services
│   └── knowledge_base.md     # Structured knowledge
└── app/
    ├── api/                  # REST API endpoints
    │   ├── chat.py          # Chat interface
    │   ├── sync.py          # Data synchronization
    │   ├── health.py        # Health checks
    │   └── migrate.py       # Data migration
    ├── core/                # Core business logic
    │   ├── database.py      # Database configuration
    │   └── rag_engine.py    # RAG implementation
    ├── models/              # Data models
    │   └── document.py      # Document, ChatSession, ChatHistory
    ├── services/            # Business services
    │   └── sync_service.py  # Content synchronization
    └── utils/               # Utilities
        ├── embeddings.py    # OpenAI embeddings
        └── text_processing.py # Text chunking
```

## 🔄 **Data Flow Architecture**

### **1. Content Ingestion Flow (Multi-Source)**
```
YesLove Blogs → POST /api/v1/sync/blogs → SyncService
External URLs → POST /api/v1/sync/external → ExternalSyncService  
Webhook Data → POST /api/v1/webhook/content → MCPSyncService
RSS Feeds → RSSyncService → MCPSyncService
Scheduled Sync → AutoSyncService → ExternalSyncService
         ↓
Source Validation → URL Pattern Matching
         ↓
chunk_text() → embed_text() → Document.save(category, priority)
         ↓
Vector Database (SQLite) with Source Attribution
```

### **2. Chat Query Flow (Priority-Based)**
```
User Question
         ↓
POST /api/v1/chat/message
         ↓
RAGEngine.generate_response()
         ↓
Crisis Detection → Abuse Support Sources First
         ↓
embed_text(query) → priority_vector_search() → retrieve_context()
         ↓
Priority Order: YesLove → Core → Abuse → Youth → Cultural → Contextual
         ↓
OpenAI API (with prioritized context + source attribution)
         ↓
Generated Response with Source Citations
```

## 🧩 **Component Details**

### **API Layer**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/chat/message` | POST | Send message to chatbot (priority-based retrieval) |
| `/api/v1/sync/blogs` | POST | Sync blog posts from main app |
| `/api/v1/sync/external` | POST | Sync single external URL |
| `/api/v1/sync/external/batch` | POST | Sync multiple external URLs |
| `/api/v1/webhook/content` | POST | Receive content via webhook |
| `/api/v1/webhook/blog` | POST | Receive blog content from main app |
| `/api/v1/admin/sync/trigger` | POST | Manually trigger content sync |
| `/api/v1/admin/sync/start` | POST | Start automated sync scheduler |
| `/api/v1/admin/sync/stop` | POST | Stop automated sync scheduler |
| `/api/v1/health` | GET | Service health check |
| `/api/v1/migrate/documents` | POST | Migrate existing vector data |

### **Core Engine**
```python
RAGEngine:
  ├── retrieve_context()    # Vector similarity search
  ├── generate_response()   # OpenAI completion with context
  └── openai (property)     # Lazy OpenAI client initialization
```

### **Data Models**
```python
Document:
  ├── id: Integer (Primary Key)
  ├── source: Text (e.g., "blog_123", URL)
  ├── chunk_index: Integer
  ├── content: Text (actual content chunk)
  ├── embedding: Text (JSON string of vector)
  ├── created_at: DateTime
  ├── doc_metadata: Text (JSON metadata)
  ├── category: Text (yeslove.blogs, relationships.core, etc.)
  ├── source_name: Text (YesLove, Relate, Brook, etc.)
  └── priority: Integer (1=highest, 5=lowest)

ChatSession:
  ├── id: Integer
  ├── session_id: Text (UUID)
  ├── user_id: Integer
  └── created_at: DateTime

ChatHistory:
  ├── id: Integer
  ├── session_id: Text
  ├── message: Text
  ├── response: Text
  └── timestamp: DateTime
```

### **Services**
```python
SyncService:
  ├── sync_blog_posts()     # Process blog content
  └── _process_blog_post()  # Individual blog processing

ExternalSyncService:
  ├── sync_external_url()   # Sync single external URL
  ├── _extract_content()    # HTML content extraction
  └── _process_external_content() # Process & categorize

AutoSyncService:
  ├── start_scheduler()     # Background sync scheduler
  ├── sync_all_sources()    # Sync all configured sources
  └── full_refresh()        # Complete content refresh

MCPSyncService:
  ├── sync_from_mcp_source() # Process webhook/RSS content
  └── _process_mcp_content() # Categorize & store

HybridSyncService:
  ├── start_production_sync() # Start all sync methods
  └── get_sync_status()      # Monitor sync health

EmbeddingService:
  ├── embed_text()          # Single text embedding
  ├── embed_texts()         # Batch embeddings
  └── get_client()          # Lazy OpenAI client
```

## 🔌 **Integration Points**

### **Main App Integration**
```python
# In main app
ChatbotClient:
  ├── send_message()        # Proxy chat requests
  ├── sync_blog_posts()     # Send blog content
  └── health_check()        # Monitor service health
```

### **External Dependencies**
- **OpenAI API**: Text embeddings + chat completions
- **SQLite**: Vector storage + chat history + source metadata
- **Flask**: Web framework + REST API + webhooks
- **SQLAlchemy**: ORM + database operations
- **BeautifulSoup4**: Web scraping + content extraction
- **Schedule**: Automated background sync
- **Requests**: HTTP client for external sources

## 📊 **Database Schema**

```sql
-- Vector storage with source categorization
CREATE TABLE documents (
    id INTEGER PRIMARY KEY,
    source TEXT NOT NULL,           -- "blog_123", URL, "mcp://source"
    chunk_index INTEGER NOT NULL,   -- Position in original content
    content TEXT NOT NULL,          -- Actual text chunk
    embedding TEXT NOT NULL,        -- JSON array of floats
    created_at DATETIME,
    doc_metadata TEXT,              -- JSON metadata
    category TEXT NOT NULL DEFAULT 'yeslove.blogs', -- Source category
    source_name TEXT,               -- Human-readable source name
    priority INTEGER DEFAULT 1     -- Retrieval priority (1=highest)
);

-- Chat sessions
CREATE TABLE chat_sessions (
    id INTEGER PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME
);

-- Chat history
CREATE TABLE chat_history (
    id INTEGER PRIMARY KEY,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp DATETIME
);
```

## 🚀 **Deployment Architecture**

### **Standalone Deployment**
```yaml
# docker-compose.yml
chatbot-service:
  build: ./chatbot-service
  ports: ["8000:8000"]
  environment:
    - VECTOR_DATABASE_URL=sqlite:///chatbot.db
    - OPENAI_API_KEY=${OPENAI_API_KEY}
  volumes:
    - chatbot_data:/app/data
```

### **Production Considerations**
- **Database**: Upgrade to PostgreSQL + pgvector for production
- **Scaling**: Multiple service instances behind load balancer
- **Monitoring**: Health checks + metrics collection
- **Security**: API authentication + rate limiting

## 🔧 **Configuration**

### **Environment Variables**
```bash
VECTOR_DATABASE_URL=sqlite:///chatbot.db    # Database connection
OPENAI_API_KEY=sk-...                       # OpenAI API key
PORT=8000                                   # Service port
```

### **Runtime Configuration**
```python
RAGEngine:
  ├── model: "gpt-4o-mini"     # OpenAI model
  ├── top_k: 5                 # Context chunks to retrieve
  └── system_message: "..."    # Chatbot personality

TextProcessing:
  ├── chunk_size: 1000         # Characters per chunk
  └── overlap: 200             # Overlap between chunks
```

## 📈 **Performance Characteristics**

### **Response Times**
- **Health Check**: ~10ms
- **Blog Sync**: ~2-5s per blog post
- **External URL Sync**: ~5-15s per URL (includes scraping)
- **Webhook Content**: ~1-2s per request
- **Chat Query**: ~1-3s (depends on OpenAI API)
- **Priority Vector Search**: ~50-100ms (SQLite)
- **Scheduled Sync**: ~5-10 minutes for all sources

### **Scalability**
- **Concurrent Users**: 50-100 (single instance)
- **Storage**: Unlimited (SQLite file-based)
- **Memory Usage**: ~200-500MB per instance
- **CPU Usage**: Low (I/O bound operations)

## 🛡 **Security & Reliability**

### **Security Measures**
- Environment-based API key management
- Input validation on all endpoints
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration for web clients

### **Error Handling**
- Graceful OpenAI API failures
- Database connection retry logic
- Comprehensive logging for debugging
- Health check endpoint for monitoring

This enhanced architecture provides a production-ready, multi-source RAG chatbot service with:

- **Credible Sources**: 23 approved relationship advice sources
- **Priority-Based Retrieval**: YesLove content first, then core sources, abuse support, youth, cultural, and contextual
- **Crisis Detection**: Automatic abuse support source prioritization
- **Multiple Sync Methods**: Scheduled, webhook, RSS, and manual sync
- **Source Attribution**: Transparent source citations in responses
- **Cultural Intelligence**: Diverse perspectives from BAATN, Black Minds Matter UK, MWNUK, SBS
- **Production Reliability**: Automated sync, error handling, and monitoring