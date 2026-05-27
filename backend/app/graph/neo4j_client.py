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
    return driver

def close_driver(driver):
    """Close the given driver."""
    try:
        driver.close()
        logger.info("Neo4j driver closed")
    except Exception:
        logger.exception("Error closing Neo4j driver")

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
    """Create uniqueness constraints."""
    try:
        run_write(driver, "CREATE CONSTRAINT ON (u:User) ASSERT u.user_id IS UNIQUE")
        run_write(driver, "CREATE CONSTRAINT ON (p:Post) ASSERT p.post_id IS UNIQUE")
        logger.info("Ensured constraints for User and Post")
    except Exception:
        logger.exception("Failed to create constraints")
