# Chatbot/RAG Microservice Architecture

## 🎯 **Microservice Design Overview**

### **Service Separation**
```
┌─────────────────────┐    ┌─────────────────────┐
│   Main YesLove App  │    │  Chatbot Service    │
│                     │    │                     │
│ • User Management   │    │ • RAG Engine        │
│ • Posts/Feed        │    │ • Vector Search     │
│ • Chat System       │    │ • OpenAI Client     │
│ • Notifications     │    │ • Knowledge Base    │
└─────────────────────┘    └─────────────────────┘
         │                           │
         └─────── HTTP API ──────────┘
```

## 📊 **Data Architecture**

### **Independent Database**
```yaml
Chatbot Service Database:
  - documents (id, content, embedding, source, metadata)
  - chat_sessions (session_id, user_id, created_at)
  - chat_history (session_id, message, response, timestamp)
  - knowledge_sources (id, name, type, last_updated)
```

### **Post Data Integration**
```python
# Option 1: API-based sync
POST /chatbot/api/sync/posts
{
  "posts": [
    {
      "id": 123,
      "content": "...",
      "author": "...",
      "timestamp": "...",
      "tags": ["relationship", "advice"]
    }
  ]
}

# Option 2: Event-driven sync
Event: "post.created"
Payload: {post_data}
→ Chatbot service ingests relevant posts
```

## 🏗 **Service Structure**

### **Chatbot Microservice Components**
```
chatbot-service/
├── app/
│   ├── api/
│   │   ├── chat.py          # Chat endpoints
│   │   ├── admin.py         # Knowledge base management
│   │   └── health.py        # Health checks
│   ├── core/
│   │   ├── rag_engine.py    # RAG implementation
│   │   ├── embeddings.py    # Embedding service
│   │   └── llm_client.py    # OpenAI client
│   ├── models/
│   │   ├── document.py      # Document model
│   │   └── chat.py          # Chat models
│   ├── services/
│   │   ├── ingestion.py     # Data ingestion
│   │   ├── vector_store.py  # Vector operations
│   │   └── sync_service.py  # Post sync from main app
│   └── utils/
├── knowledge_base/          # Static knowledge files
├── docker/
├── requirements.txt
└── main.py
```

## 🔄 **API Design**

### **Core Endpoints**
```python
# Chat Interface
POST /api/v1/chat
{
  "message": "How do I handle relationship conflicts?",
  "session_id": "uuid",
  "user_id": "123",
  "context": ["previous", "messages"]
}

# Knowledge Management
POST /api/v1/knowledge/ingest
{
  "source": "blog_post",
  "content": "...",
  "metadata": {"author": "...", "tags": [...]}
}

# Post Sync (from main app)
POST /api/v1/sync/posts
{
  "posts": [...],
  "action": "create|update|delete"
}

# Health & Metrics
GET /api/v1/health
GET /api/v1/metrics
```

## 🔗 **Integration with Main App**

### **1. API Gateway Pattern**
```python
# In main app - chatbot proxy
@api.route("/chatbot/message")
def chatbot_proxy():
    response = requests.post(
        f"{CHATBOT_SERVICE_URL}/api/v1/chat",
        json=request.json,
        headers={"Authorization": request.headers.get("Authorization")}
    )
    return response.json()
```

### **2. Event-Driven Sync**
```python
# In main app - post creation
def create_post(content, user_id):
    post = Post(content=content, user_id=user_id)
    db.session.add(post)
    db.session.commit()
    
    # Async sync to chatbot service
    sync_post_to_chatbot.delay(post.to_dict())

# Celery task
@celery.task
def sync_post_to_chatbot(post_data):
    requests.post(f"{CHATBOT_SERVICE_URL}/api/v1/sync/posts", json=post_data)
```

## 🚀 **Deployment Architecture**

### **Docker Compose**
```yaml
version: '3.8'
services:
  main-app:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      - CHATBOT_SERVICE_URL=http://chatbot-service:8000
    
  chatbot-service:
    build: ./chatbot-service
    ports: ["8000:8000"]
    environment:
      - VECTOR_DATABASE_URL=postgresql://...
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on: [vector-db]
    
  vector-db:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_DB=chatbot_vectors
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatbot-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatbot-service
  template:
    spec:
      containers:
      - name: chatbot
        image: yeslove/chatbot-service:latest
        ports: [containerPort: 8000]
        env:
        - name: VECTOR_DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: chatbot-secrets
              key: database-url
```

## 📈 **Benefits of Microservice Approach**

### **Scalability**
- Independent scaling based on chat volume
- Dedicated resources for vector operations
- Separate database optimized for embeddings

### **Maintainability**
- Isolated codebase for AI/ML features
- Independent deployment cycles
- Specialized team ownership

### **Performance**
- Dedicated vector database with pgvector
- Optimized for similarity search
- No resource contention with main app

### **Reliability**
- Service isolation - chatbot issues don't affect main app
- Independent monitoring and alerting
- Graceful degradation if chatbot is down

## 🔄 **Migration Strategy**

### **Phase 1: Extract Service**
1. Create new chatbot service repository
2. Copy existing chatbot code
3. Set up independent database
4. Implement API endpoints

### **Phase 2: Data Migration**
1. Export existing vector data
2. Import to new vector database
3. Sync knowledge base files
4. Test RAG functionality

### **Phase 3: Integration**
1. Update main app to call chatbot service
2. Implement post sync mechanism
3. Add monitoring and logging
4. Deploy both services

### **Phase 4: Optimization**
1. Fine-tune vector search parameters
2. Implement caching layer
3. Add advanced RAG features
4. Scale based on usage patterns

## 🛡 **Security Considerations**

### **Authentication**
- JWT token validation between services
- API key authentication for service-to-service calls
- Rate limiting on chatbot endpoints

### **Data Privacy**
- Encrypt sensitive data in vector database
- Implement data retention policies
- Audit logging for compliance

## 📊 **Monitoring & Observability**

### **Metrics**
- Response time for RAG queries
- Vector search accuracy
- OpenAI API usage and costs
- Knowledge base freshness

### **Logging**
- Structured logging for all interactions
- Error tracking and alerting
- Performance monitoring
- Usage analytics

This microservice architecture provides a scalable, maintainable solution for the RAG/chatbot functionality while maintaining clean separation from the main application.