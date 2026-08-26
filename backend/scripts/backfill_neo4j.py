#!/usr/bin/env python3
"""Backfill the Bolt graph database from the relational backend database."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.models import Like, Post, User, db
from sqlalchemy import inspect, text


def main():
    app = create_app()

    with app.app_context():
        graph_repository = getattr(app, "graph_repository", None)
        if not graph_repository:
            print("Graph database is not configured. Set GRAPH_DB_URI, and GRAPH_DB_USER/GRAPH_DB_PASS if auth is enabled.")
            return 1

        user_count = 0
        post_count = 0
        follow_count = 0
        like_count = 0

        users = User.query.all()
        for user in users:
            graph_repository.create_user(
                user.keycloak_id,
                {
                    "username": user.username,
                    "user_type": user.user_type,
                    "profile_pic_url": user.profile_pic_url or "",
                },
            )
            user_count += 1

        posts = Post.query.all()
        for post in posts:
            author = post.author
            author_id = author.keycloak_id if author else None
            graph_repository.merge_post_node(
                post.id,
                author_id=author_id,
                props={
                    "content": (post.content or "")[:100],
                    "timestamp": post.timestamp.isoformat() if post.timestamp else "",
                },
            )
            post_count += 1

        inspector = inspect(db.engine)
        follow_columns = {column["name"] for column in inspector.get_columns("follow")}
        has_follow_type = "follow_type" in follow_columns

        follow_query = "SELECT follower_id, followed_id"
        if has_follow_type:
            follow_query += ", follow_type"
        follow_query += " FROM follow"

        follows = db.session.execute(text(follow_query)).mappings().all()
        for follow in follows:
            follower = User.query.get(follow["follower_id"])
            followed = User.query.get(follow["followed_id"])
            if not follower or not followed:
                continue

            graph_repository.follow(
                follower.keycloak_id,
                followed.keycloak_id,
                (follow.get("follow_type") or "basic") if has_follow_type else "basic",
            )
            follow_count += 1

        likes = Like.query.all()
        for like in likes:
            user = User.query.get(like.user_id)
            if not user:
                continue

            graph_repository.like_post(
                user.keycloak_id,
                like.post_id,
                reaction_type="like",
            )
            like_count += 1

        print(
            "Backfill complete:",
            f"users={user_count}",
            f"posts={post_count}",
            f"follows={follow_count}",
            f"likes={like_count}",
        )
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
