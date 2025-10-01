r"""Simple test script to exercise Neo4j (Bolt) and Amazon Neptune (Gremlin).

Usage examples (PowerShell):

# Test Neo4j (local docker-compose)
$env:GRAPH_TYPE = 'neo4j';
$env:NEO4J_URI = 'bolt://localhost:7687';
$env:NEO4J_USER = 'neo4j';
$env:NEO4J_PASS = 'testpassword';
python ./backend/scripts/test_graph.py

# Test Neptune (direct endpoint accessible from your machine)
$env:GRAPH_TYPE = 'neptune';
$env:NEPTUNE_ENDPOINT = 'your-neptune-endpoint.cluster-xxxxx.us-east-1.neptune.amazonaws.com';
$env:NEPTUNE_PORT = '8182';
python ./backend/scripts/test_graph.py

Notes:
- For Neptune clusters that require IAM SigV4 signing, this project currently expects a plain wss connection (no signing). You can either:
    * For development, create a Neptune cluster without IAM auth and allow access from your IP via security groups and optionally an SSH tunnel to a bastion host in the same VPC.
    * Or extend the Neptune client to sign WebSocket requests using AWS SigV4 (not implemented in this helper script).

This script performs:
- create two users (user_a, user_b)
- make user_a follow user_b
- query followers count or list
"""

import os
import sys
import time

GRAPH_TYPE = os.getenv('GRAPH_TYPE', 'neo4j').lower()

# Common test data
USER_A = 'test_user_A'
USER_B = 'test_user_B'


def test_neo4j():
    try:
        from neo4j import GraphDatabase
    except Exception as e:
        print('neo4j package not installed:', e)
        print('Install with: pip install neo4j')
        return

    uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
    user = os.getenv('NEO4J_USER', 'neo4j')
    password = os.getenv('NEO4J_PASS', 'testpassword')

    print(f'Connecting to Neo4j at {uri} as {user}')
    driver = GraphDatabase.driver(uri, auth=(user, password))

    try:
        with driver.session() as session:
            # MERGE users
            print('Creating/updating users...')
            session.execute_write(lambda tx: tx.run("MERGE (u:User {user_id:$id, username:$name}) RETURN u", id=USER_A, name='Alice'))
            session.execute_write(lambda tx: tx.run("MERGE (u:User {user_id:$id, username:$name}) RETURN u", id=USER_B, name='Bob'))

            # Create follow relationship
            print(f'{USER_A} follows {USER_B}')
            session.execute_write(lambda tx: tx.run(
                "MATCH (a:User {user_id:$a}), (b:User {user_id:$b}) MERGE (a)-[r:FOLLOWS]->(b) SET r.created_at = datetime() RETURN r",
                a=USER_A, b=USER_B))

            # Query follower count for USER_B
            result = session.execute_read(lambda tx: tx.run(
                "MATCH (f:User)-[:FOLLOWS]->(u:User {user_id:$user_id}) RETURN count(f) AS cnt", user_id=USER_B).single())
            cnt = result.get('cnt') if result else 0
            print(f'Follower count for {USER_B}:', int(cnt))

            # Cleanup (optional) - uncomment to remove test data
            # session.write_transaction(lambda tx: tx.run("MATCH (u:User {user_id:$id}) DETACH DELETE u", id=USER_A))
            # session.write_transaction(lambda tx: tx.run("MATCH (u:User {user_id:$id}) DETACH DELETE u", id=USER_B))

    except Exception as e:
        print('Neo4j test failed:', e)
    finally:
        try:
            driver.close()
        except Exception:
            pass


def test_neptune():
    # Uses project NeptuneClient if available
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    try:
        from app.graph.neptune_client import create_neptune_client
    except Exception as e:
        print('Failed to import project Neptune helper (ensure you run from repo root):', e)
        print('Path entries:', sys.path[:3])
        return

    endpoint = os.getenv('NEPTUNE_ENDPOINT')
    port = int(os.getenv('NEPTUNE_PORT', 8182))

    if not endpoint:
        print('NEPTUNE_ENDPOINT not set; cannot test Neptune')
        return

    print(f'Creating Neptune client to {endpoint}:{port} (wss)')
    client = create_neptune_client(endpoint, port)
    if not client:
        print('Failed to create/connect Neptune client. Check endpoint, network (VPC/SSH tunnel), and TLS settings.')
        return

    try:
        print('Creating/updating users...')
        ok = client.create_user(USER_A, {'username': 'Alice'})
        print('create_user A ->', ok)
        ok = client.create_user(USER_B, {'username': 'Bob'})
        print('create_user B ->', ok)

        print(f'{USER_A} follows {USER_B}')
        ok = client.follow_user(USER_A, USER_B, follow_type='basic')
        print('follow ->', ok)

        count = client.get_follower_count(USER_B)
        print(f'Follower count for {USER_B}:', count)

        recs = client.get_recommendations(USER_A)
        print('Recommendations for', USER_A, '->', recs)

        # Cleanup not implemented here - NeptuneClient currently does not expose delete helpers

    except Exception as e:
        print('Neptune test failed:', e)
    finally:
        try:
            client.close()
        except Exception:
            pass


if __name__ == '__main__':
    print('Running graph tests for:', GRAPH_TYPE)
    if GRAPH_TYPE == 'neo4j':
        test_neo4j()
    elif GRAPH_TYPE == 'neptune':
        test_neptune()
    else:
        print('Unknown GRAPH_TYPE:', GRAPH_TYPE)
        print('Set GRAPH_TYPE to "neo4j" or "neptune"')
