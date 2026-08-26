import json
import os
import re
from html import unescape
from sqlalchemy.orm import Session
import requests
from app.models.document import Document
from app.core.database import SessionLocal
from app.utils.embeddings import embed_text
from app.utils.text_processing import chunk_text
from app.utils.source_validator import is_url_allowed, get_source_priority
from config.sources import SOURCE_CATEGORIES

class SyncService:
    def __init__(self):
        pass

    def sync_wordpress_blog_posts(self, page: int = 1, per_page: int = 25) -> dict:
        """Fetch and sync blog posts from the WordPress REST API."""
        posts = self.fetch_wordpress_blog_posts(page=page, per_page=per_page)
        return self.sync_blog_posts(posts)

    def fetch_wordpress_blog_posts(self, page: int = 1, per_page: int = 25) -> list:
        """Fetch normalized WordPress blog posts."""
        base_url = os.getenv("WORDPRESS_BLOG_API_URL", "https://yeslove.co.uk/wp-json/wp/v2/posts").rstrip("/")
        response = requests.get(
            base_url,
            params={"page": page, "per_page": per_page, "_embed": 1},
            timeout=15,
        )
        response.raise_for_status()
        return [self._normalize_wordpress_post(post) for post in response.json()]

    def _normalize_wordpress_post(self, post: dict) -> dict:
        post_id = post.get("id")
        embedded = post.get("_embedded", {})
        media = embedded.get("wp:featuredmedia", [])
        image_url = media[0].get("source_url") if media and isinstance(media, list) else None

        return {
            "id": post_id,
            "source_id": post_id,
            "resource_id": f"wordpress_blog:{post_id}",
            "source": "wordpress",
            "type": "blog",
            "title": self._rendered(post.get("title")),
            "summary": self._rendered(post.get("excerpt")),
            "content": self._rendered(post.get("content")),
            "author": "YesLove",
            "timestamp": post.get("date_gmt") or post.get("date"),
            "published_at": post.get("date_gmt") or post.get("date"),
            "url": post.get("link"),
            "image_url": image_url,
        }

    def _rendered(self, value):
        if isinstance(value, dict):
            value = value.get("rendered", "")
        text = re.sub(r"<[^>]*>", " ", unescape(value or ""))
        return re.sub(r"\s+", " ", text).strip()

    def sync_blog_posts(self, blog_posts: list) -> dict:
        """Sync blog posts from main app"""
        processed = 0
        errors = []
        
        with SessionLocal() as session:
            try:
                for blog_data in blog_posts:
                    try:
                        self._process_blog_post(session, blog_data)
                        processed += 1
                    except Exception as e:
                        errors.append(f"Blog {blog_data.get('id')}: {str(e)}")
                
                session.commit()
                
            except Exception as e:
                session.rollback()
                raise e
        
        return {
            "processed": processed,
            "errors": errors,
            "total": len(blog_posts)
        }

    def _process_blog_post(self, session: Session, blog_data: dict):
        """Process blog post into document chunks"""
        content = "\n\n".join(
            value for value in [
                blog_data.get('title', ''),
                blog_data.get('summary') or '',
                blog_data.get('content', ''),
            ] if value
        )
        blog_id = blog_data.get('id')
        source_id = blog_data.get("source_id", blog_id)
        author = blog_data.get('author', 'YesLove')
        source_prefix = "wordpress_blog" if blog_data.get("source") == "wordpress" else "blog"
        document_source = f"{source_prefix}_{source_id if source_prefix == 'wordpress_blog' else blog_id}"
        
        metadata = {
            "blog_id": blog_id,
            "source_id": source_id,
            "resource_id": blog_data.get("resource_id", f"blog:{blog_id}"),
            "author": author,
            "type": blog_data.get("type", "blog"),
            "title": blog_data.get('title', ''),
            "summary": blog_data.get("summary"),
            "url": blog_data.get("url"),
            "image_url": blog_data.get("image_url"),
            "published_at": blog_data.get("published_at") or blog_data.get("timestamp"),
        }
        
        chunks = chunk_text(content)
        
        # Remove existing chunks
        session.query(Document).filter(
            Document.source == document_source
        ).delete()
        
        # Add new chunks
        for idx, chunk in enumerate(chunks):
            embedding = embed_text(chunk)
            
            doc = Document(
                source=document_source,
                chunk_index=idx,
                content=chunk,
                embedding=json.dumps(embedding),
                doc_metadata=json.dumps(metadata),
                category="yeslove.blogs",
                source_name="YesLove",
                priority=1
            )
            session.add(doc)

    def sync_content_resources(self, resources: list) -> dict:
        """Sync generic recommendable resources such as blogs and video podcasts."""
        processed = 0
        errors = []

        with SessionLocal() as session:
            try:
                for resource in resources:
                    try:
                        self._process_content_resource(session, resource)
                        processed += 1
                    except Exception as e:
                        errors.append(f"Resource {resource.get('id') or resource.get('source_id')}: {str(e)}")

                session.commit()
            except Exception as e:
                session.rollback()
                raise e

        return {
            "processed": processed,
            "errors": errors,
            "total": len(resources)
        }

    def _process_content_resource(self, session: Session, resource: dict):
        """Process a generic resource into document chunks."""
        resource_type = resource.get("type", "content")
        source_id = resource.get("source_id") or resource.get("id")
        resource_id = resource.get("id") or f"{resource_type}:{source_id}"
        source = f"{resource_type}_{source_id}"
        title = resource.get("title", "")
        summary = resource.get("summary") or resource.get("description") or ""
        content = resource.get("content") or resource.get("transcript") or ""
        tags = resource.get("tags") or []

        searchable_text = "\n\n".join(
            value for value in [
                title,
                summary,
                " ".join(tags) if isinstance(tags, list) else str(tags),
                content,
            ] if value
        )
        if not searchable_text.strip():
            raise ValueError("Content resource has no searchable text")

        metadata = {
            "resource_id": resource_id,
            "source_id": source_id,
            "type": resource_type,
            "title": title,
            "summary": summary,
            "url": resource.get("url") or resource.get("video_url"),
            "image_url": resource.get("image_url"),
            "thumbnail_url": resource.get("thumbnail_url"),
            "video_url": resource.get("video_url"),
            "tags": tags,
            "author": resource.get("author", "YesLove"),
            "published_at": resource.get("published_at"),
        }

        session.query(Document).filter(Document.source == source).delete()

        category = "yeslove.video-podcasts" if resource_type == "video_podcast" else "yeslove.blogs"
        for idx, chunk in enumerate(chunk_text(searchable_text)):
            embedding = embed_text(chunk)
            doc = Document(
                source=source,
                chunk_index=idx,
                content=chunk,
                embedding=json.dumps(embedding),
                doc_metadata=json.dumps(metadata),
                category=category,
                source_name=title or "YesLove",
                priority=1,
            )
            session.add(doc)
