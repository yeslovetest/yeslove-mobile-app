# YesLove Chatbot Microservice

Independent RAG-powered chatbot service for relationship and mental health advice.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL with pgvector extension
- OpenAI API key

### Setup

1. **Install dependencies**
```bash
pip install -r requirements.txt
```

2. **Environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Database setup**
```bash
# Create PostgreSQL database with pgvector
createdb chatbot_vectors
psql chatbot_vectors -c "CREATE EXTENSION vector;"
```

4. **Run the service**
```bash
python main.py
```

Service runs on `http://localhost:8000`

## 📊 API Endpoints

### Chat
- `POST /api/v1/chat/message` - Send message to chatbot

### Data Sync
- `POST /api/v1/sync/posts` - Sync posts from main app
- `POST /api/v1/sync/blogs` - Sync blog posts from main app

### Health
- `GET /api/v1/health` - Health check

### Documentation
- `GET /docs` - Swagger API documentation

## 🔄 Data Pipeline

The service receives data from the main YesLove app through:

1. **Real-time sync** - New posts/blogs automatically synced via Celery tasks
2. **Bulk sync** - Migration script for existing data
3. **API sync** - Manual sync via REST endpoints

## 🏗 Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│   Main YesLove App  │───▶│  Chatbot Service    │
│                     │    │                     │
│ • Creates posts     │    │ • RAG Engine        │
│ • Triggers sync     │    │ • Vector Search     │
│ • Proxies chat      │    │ • OpenAI Client     │
└─────────────────────┘    └─────────────────────┘
                                      │
                           ┌─────────────────────┐
                           │  Vector Database    │
                           │                     │
                           │ • Documents         │
                           │ • Embeddings        │
                           │ • Chat History      │
                           └─────────────────────┘
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t yeslove/chatbot-service .

# Run with Docker Compose
docker-compose -f ../docker-compose.microservices.yml up chatbot-service
```

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VECTOR_DATABASE_URL` | PostgreSQL connection string | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `PORT` | Service port | 8000 |

## 📈 Monitoring

- Health endpoint: `/api/v1/health`
- Logs: Structured JSON logging
- Metrics: Response times, error rates, token usage

## 🔒 Security

- API key authentication for service-to-service calls
- Input validation and sanitization
- Rate limiting on endpoints
- Encrypted database connections