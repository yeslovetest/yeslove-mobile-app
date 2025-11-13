# Enhanced RAG System Setup

## Completed Tasks ✅

1. **Database Migration**: Added new columns (category, source_name, priority) to documents table
2. **Requirements Updated**: Added beautifulsoup4==4.12.2 to requirements.txt
3. **API Blueprint Registered**: External sync endpoints available at `/api/v1/sync/external`
4. **Migration Script**: Successfully ran database schema updates

## Next Steps 🚀

### Install Dependencies
```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Sync External Sources
```bash
# Run the sync script
python3 scripts/sync_external_sources.py
```

### API Endpoints Available
- `POST /api/v1/sync/external` - Sync single URL
- `POST /api/v1/sync/external/batch` - Sync multiple URLs

### Test Enhanced RAG
The system now supports:
- Priority-based retrieval (YesLove → Core → Abuse Support → Youth → Cultural → Contextual)
- Crisis detection for abuse/harm queries
- Source attribution in responses
- URL filtering and validation

### Example Usage
```bash
# Sync a single external source
curl -X POST http://localhost:8000/api/v1/sync/external \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.relate.org.uk/get-help/relationship-help/"}'

# Test chat with enhanced sources
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I handle relationship conflict?"}'
```