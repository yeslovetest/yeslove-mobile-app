# YesLove Chatbot Service Diagrams

This directory contains visual diagrams for the YesLove Chatbot Service architecture.

## Diagram Files

### 📊 [System Overview](./system-overview.md)
High-level architecture showing the four main layers: API, Core Engine, Services, and Storage.

### 🔄 [Data Flow](./data-flow.md)
Sequence diagrams illustrating:
- Content ingestion flow (blog sync)
- Chat query processing flow

### 🗄️ [Database Schema](./database-schema.md)
Entity relationship diagram and enhanced vector storage architecture showing:
- Database tables with source categorization fields
- Multi-source vector storage workflow
- Priority-based retrieval system

### 🎯 [Source Architecture](./source-architecture.md)
Source categorization and URL pattern matching showing:
- 5-tier priority system (YesLove → Core → Abuse → Youth → Cultural → Contextual)
- 23 approved external sources with URL patterns
- Blocked pattern filtering system

### 🚀 [Deployment](./deployment.md)
Deployment architecture diagrams for:
- Standalone Docker deployment
- Production multi-instance setup

### 🔌 [Integration](./integration.md)
Integration patterns showing:
- Main app integration points
- API flow sequences
- Component dependencies

## Viewing Diagrams

These diagrams use Mermaid syntax and can be viewed in:
- GitHub (native Mermaid support)
- VS Code with Mermaid extension
- Mermaid Live Editor: https://mermaid.live/
- Any Markdown viewer with Mermaid support

## Diagram Types Used

- **Flowcharts**: System architecture and component relationships
- **Sequence Diagrams**: API interactions and data flows
- **Entity Relationship**: Database schema
- **Deployment Diagrams**: Infrastructure and scaling patterns