from typing import Any, Dict, List, Optional
import logging

from app.graph.neo4j_client import create_constraints, run_read, run_write

logger = logging.getLogger(__name__)


class GraphRepository:
    """Thin repository over a Bolt-compatible graph database.

    Dev mode: no migration needed because there are no users to migrate. Nodes
    will be created on demand.
    """

    def __init__(self, driver: Any) -> None:
        self.driver = driver

    def ensure_constraints(self) -> None:
        try:
            create_constraints(self.driver)
        except Exception:
            logger.exception("Failed to ensure graph constraints")

    def create_user(self, user_id: str, props: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        props = props or {}
        cypher = "MERGE (u:User {user_id:$user_id}) SET u += $props RETURN properties(u) AS user"
        rows = run_write(self.driver, cypher, {"user_id": user_id, "props": props})
        return rows[0]["user"] if rows else {}

    def merge_post_node(self, post_id: int, author_id: Optional[str] = None, props: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        props = props or {}
        cypher = "MERGE (p:Post {post_id:$post_id}) SET p += $props"
        params: Dict[str, Any] = {"post_id": post_id, "props": props}
        if author_id:
            cypher += " WITH p MERGE (u:User {user_id:$author_id}) MERGE (u)-[:AUTHORED]->(p)"
            params["author_id"] = author_id
        cypher += " RETURN properties(p) AS post"
        rows = run_write(self.driver, cypher, params)
        return rows[0]["post"] if rows else {}

    def follow(self, follower_id: str, followed_id: str, follow_type: str = "basic") -> Dict[str, Any]:
        cypher = (
            "MATCH (a:User {user_id:$follower}), (b:User {user_id:$followed})\n"
            "MERGE (a)-[r:FOLLOWS]->(b)\n"
            "SET r.follow_type = $type, r.created_at = datetime()\n"
            "RETURN properties(r) AS rel"
        )
        rows = run_write(self.driver, cypher, {"follower": follower_id, "followed": followed_id, "type": follow_type})
        return rows[0]["rel"] if rows else {}

    def unfollow(self, follower_id: str, followed_id: str) -> None:
        cypher = "MATCH (a:User {user_id:$follower})-[r:FOLLOWS]->(b:User {user_id:$followed}) DELETE r"
        run_write(self.driver, cypher, {"follower": follower_id, "followed": followed_id})

    def get_followers_page(self, user_id: str, skip: int = 0, limit: int = 100) -> List[str]:
        cypher = (
            "MATCH (f:User)-[:FOLLOWS]->(u:User {user_id:$user_id})\n"
            "RETURN f.user_id AS follower_id\n"
            "SKIP $skip LIMIT $limit"
        )
        rows = run_read(self.driver, cypher, {"user_id": user_id, "skip": skip, "limit": limit})
        return [r["follower_id"] for r in rows]

    def get_follower_count(self, user_id: str) -> int:
        cypher = "MATCH (f:User)-[:FOLLOWS]->(u:User {user_id:$user_id}) RETURN count(f) AS cnt"
        rows = run_read(self.driver, cypher, {"user_id": user_id})
        if not rows:
            return 0
        return int(rows[0].get("cnt", 0))

    def like_post(self, user_id: str, post_id: int, reaction_type: Optional[str] = None) -> Dict[str, Any]:
        cypher = (
            "MATCH (u:User {user_id:$user_id}), (p:Post {post_id:$post_id})\n"
            "MERGE (u)-[r:LIKED]->(p)\n"
            "SET r.reaction_type = $reaction_type, r.created_at = datetime()\n"
            "RETURN properties(r) AS rel"
        )
        rows = run_write(self.driver, cypher, {"user_id": user_id, "post_id": post_id, "reaction_type": reaction_type})
        return rows[0]["rel"] if rows else {}

    def recommendations(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        cypher = (
            "MATCH (u:User {user_id:$user_id})-[:FOLLOWS]->(f)-[:FOLLOWS]->(rec:User)\n"
            "WHERE NOT (u)-[:FOLLOWS]->(rec) AND rec.user_id <> $user_id\n"
            "RETURN rec.user_id AS user_id, rec.username AS username, COUNT(*) AS score\n"
            "ORDER BY score DESC\n"
            "LIMIT $limit"
        )
        rows = run_read(self.driver, cypher, {"user_id": user_id, "limit": limit})
        return [{"user_id": r.get("user_id"), "username": r.get("username"), "score": int(r.get("score", 0))} for r in rows]

