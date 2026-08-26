"""
This module provides helpers to create/close a driver and run read/write transactions.
"""
from neo4j import GraphDatabase
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)

def create_driver(uri: str, user: str, password: str):
    """Create and return a Neo4j/Memgraph driver instance."""
    logger.info("Creating Neo4j driver for %s", uri)
    driver = GraphDatabase.driver(uri, auth=(user, password))
def create_driver(uri: str, user: Optional[str] = None, password: Optional[str] = None):
    """Create and return a Bolt graph driver instance."""
    logger.info("Creating graph driver for %s", uri)
    auth = (user, password or "") if user else None
    driver = GraphDatabase.driver(
        uri,
        auth=auth,
        connection_timeout=2,
        max_transaction_retry_time=2,
    )
    return driver

def close_driver(driver):
    """Close the given driver."""
    try:
        driver.close()
        logger.info("Graph driver closed")
    except Exception:
        logger.exception("Error closing graph driver")

def run_read(driver, cypher: str, params: Optional[Dict[str, Any]] = None):
    """Run a read transaction and return a list of records."""
    params = params or {}
    with driver.session() as session:
        result = session.execute_read(lambda tx: tx.run(cypher, **params).data())
    return result

def run_write(driver, cypher: str, params: Optional[Dict[str, Any]] = None):
    """Run a write transaction. Constraints run outside transactions for Memgraph."""
    params = params or {}
    if "CONSTRAINT" in cypher.upper():
        with driver.session() as session:
            result = session.run(cypher, **params).data()
        return result
    with driver.session() as session:
        result = session.execute_write(lambda tx: tx.run(cypher, **params).data())
    return result

def create_constraints(driver):
    """Create recommended uniqueness constraints for development.

    This will try to create constraints for :User.user_id and :Post.post_id,
    ignoring errors if they already exist.
    """
    constraints = (
        (
            "CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.user_id IS UNIQUE",
            "CREATE CONSTRAINT ON (u:User) ASSERT u.user_id IS UNIQUE",
        ),
        (
            "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Post) REQUIRE p.post_id IS UNIQUE",
            "CREATE CONSTRAINT ON (p:Post) ASSERT p.post_id IS UNIQUE",
        ),
    )
    for statements in constraints:
        _run_first_supported_constraint(driver, statements)
    logger.info("Ensured graph constraints for User and Post")


def _run_first_supported_constraint(driver, statements):
    last_error = None
    for statement in statements:
        try:
            run_write(driver, statement)
            return
        except Exception as exc:
            if _is_existing_constraint_error(exc):
                return
            last_error = exc

    if last_error:
        logger.warning("Could not create graph constraint: %s", last_error)


def _is_existing_constraint_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return "already exists" in message or "equivalent constraint" in message
    """Create uniqueness constraints."""
    try:
        run_write(driver, "CREATE CONSTRAINT ON (u:User) ASSERT u.user_id IS UNIQUE")
        run_write(driver, "CREATE CONSTRAINT ON (p:Post) ASSERT p.post_id IS UNIQUE")
        logger.info("Ensured constraints for User and Post")
    except Exception:
        logger.exception("Failed to create constraints")
