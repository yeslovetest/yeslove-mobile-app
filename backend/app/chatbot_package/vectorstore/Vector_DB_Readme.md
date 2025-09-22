# Updating the Vector Database

This README explains how to update and manage your vector database using Docker and Alembic migrations.

---

## Prerequisites

- Docker & Docker Compose installed
- Your project folder structure with:
  - `docker-compose.yaml` defining the `postgres_vector` service
  - `vector_alembic.ini` at the `backend/` root
  - Alembic migrations in `app/chatbot_package/vectorstore/migrations/`
  - `.env` file in `backend/` containing:
    ```dotenv
    VECTOR_DB_USER=vector_user
    VECTOR_DB_PASSWORD=vector_secret
    VECTOR_DB_NAME=vector_store
    VECTOR_DATABASE_URL=postgresql+psycopg2://vector_user:vector_secret@localhost:5433/vector_store
    ```

---

## 1. Start the Vector Postgres Container

From the `backend/` directory run:

```bash
# Ensure using the compose file in backend/
docker-compose up -d postgres_vector
```

This spins up a Postgres instance with pgvector installed (via the `ankane/pgvector` image), listening on host port `5433`.

Verify it’s running:

```bash
docker ps | grep postgres_vector
# You should see: 0.0.0.0:5433->5432/tcp
```

---

## 2. Apply Database Migrations (Schema Updates)

When you add or modify migrations under `vectorstore/migrations`, apply them with Alembic:

```bash
# Make sure the env var is set in this shell:
export VECTOR_DATABASE_URL="postgresql+psycopg2://vector_user:vector_secret@localhost:5433/vector_store"

# Or in PowerShell:
# $env:VECTOR_DATABASE_URL = "postgresql+psycopg2://vector_user:vector_secret@localhost:5433/vector_store"

# Apply all pending migrations
alembic -c vector_alembic.ini upgrade head
```

You should see output like:

```
INFO  [alembic.runtime.migration] Running upgrade -> 1cd7e01bfb1f, add vector extension & documents table
```

To check current revision:

```bash
alembic -c vector_alembic.ini current
# e.g. 1cd7e01bfb1f (head)
```

---

## 3. Ingest or Re-Ingest Documents

After schema changes, you need to ingest your markdown files into the vector DB:

```bash
# From backend/
python -m app.chatbot_package.vectorstore.ingest
```

Alternatively, run inside Docker if you have a `web` service defined:

```bash
docker-compose run --rm web python -m app.chatbot_package.vectorstore.ingest
```

Successful output:

```
Ingested 123 document chunks.
```

---

## 4. Verification

Connect via psql to inspect tables and extensions:

```bash
docker-compose exec postgres_vector psql -U vector_user -d vector_store
```

Inside `psql`:

```sql
-- List extensions
\dx
-- Should include "vector"

-- List tables
\dt
-- Should include "documents"

-- Describe documents table
\d+ documents
```

Exit with `\q`.

---

## 5. Rolling Back a Migration

If you need to revert a schema change:

```bash
# Downgrade to base (clears alembic_version)
alembic -c vector_alembic.ini downgrade base
```

Then re-upgrade or apply a specific migration:

```bash
alembic -c vector_alembic.ini upgrade <revision_id>
```

---

## 6. Tips

- Keep only one `.env` in `backend/` so that both Flask and your scripts load the same environment variables.
- Always tear down volumes if you change extensions or large schema resets:
  ```bash
  ```

docker-compose down -v postgres\_vector docker-compose up -d postgres\_vector

```
- Use `docker-compose logs postgres_vector` to troubleshoot container startup issues.

---

With these steps, you can manage, migrate, and populate your vector database entirely via Docker and Alembic.

```
