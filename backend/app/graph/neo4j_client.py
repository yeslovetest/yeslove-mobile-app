"""Small Neo4j helper using the official driver.

This module provides helpers to create/close a driver and run read/write transactions.
It intentionally keeps a thin wrapper so the app can call Cypher directly or build a
higher-level repository on top.
"""
from neo4j import GraphDatabase
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)


def create_driver(uri: str, user: str, password: str):
    """Create and return a Neo4j driver instance."""
    logger.info("Creating Neo4j driver for %s", uri)
    driver = GraphDatabase.driver(uri, auth=(user, password))
    return driver


def close_driver(driver):
    """Close the given Neo4j driver."""
    try:
        driver.close()
        logger.info("Neo4j driver closed")
    except Exception:
        logger.exception("Error closing Neo4j driver")


def run_read(driver, cypher: str, params: Optional[Dict[str, Any]] = None):
    """Run a read transaction and return a list of records (as dicts).

    Example:
        run_read(driver, "MATCH (u:User) RETURN u.user_id AS id")
    """
    params = params or {}
    with driver.session() as session:
        result = session.read_transaction(lambda tx: tx.run(cypher, **params).data())
    return result


def run_write(driver, cypher: str, params: Optional[Dict[str, Any]] = None):
    """Run a write transaction and return records (if any).

    Example:
        run_write(driver, "MERGE (u:User {user_id:$id}) RETURN u", {"id": 123})
    """
    params = params or {}
    with driver.session() as session:
        result = session.write_transaction(lambda tx: tx.run(cypher, **params).data())
    return result


def create_constraints(driver):
    """Create recommended uniqueness constraints for development.

    This will try to create constraints for :User.user_id and :Post.post_id,
    ignoring errors if they already exist.
    """
    try:
        # Use CREATE CONSTRAINT IF NOT EXISTS (Neo4j 4.1+)
        run_write(driver, "CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.user_id IS UNIQUE")
        run_write(driver, "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Post) REQUIRE p.post_id IS UNIQUE")
        logger.info("Ensured Neo4j constraints for User and Post")
    except Exception:
        logger.exception("Failed to create Neo4j constraints")
