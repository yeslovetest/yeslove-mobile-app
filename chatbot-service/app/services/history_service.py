"""Store and retrieve chatbot conversation history."""
import logging
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import SessionLocal
from app.models.document import ChatSession, ChatHistory

logger = logging.getLogger(__name__)

# Values that mean "no verifiable owner" for a session.
_NO_OWNER = (None, "", "anonymous")


def get_session_history(session_id: str, limit: int = 10) -> list:
    try:
        with SessionLocal() as db:
            rows = (
                db.query(ChatHistory)
                .filter(ChatHistory.session_id == session_id)
                .order_by(ChatHistory.id.desc())
                .limit(limit)
                .all()
            )
    except SQLAlchemyError as e:
        logger.error("Failed to load history for session %s: %s", session_id, e)
        return []

    messages = []
    for row in reversed(rows):
        messages.append({"role": "user", "content": row.message})
        messages.append({"role": "assistant", "content": row.response})
    return messages


def save_message(session_id: str, user_id, message: str, response: str) -> bool:
    try:
        with SessionLocal() as db:
            session_exists = db.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            if not session_exists:
                # Identity is the Keycloak "sub" (a UUID string). Store it as-is.
                # If there's no verifiable owner, store NULL rather than a shared
                # placeholder, so two unknown users can never collapse into one.
                owner = None if user_id in _NO_OWNER else str(user_id)
                db.add(ChatSession(session_id=session_id, user_id=owner))

            db.add(ChatHistory(
                session_id=session_id,
                message=message,
                response=response,
            ))
            db.commit()
        return True
    except SQLAlchemyError as e:
        logger.error("Failed to save history for session %s: %s", session_id, e)
        return False


def user_owns_session(session_id: str, user_id) -> bool:
    # No verifiable identity -> deny by default.
    if user_id in _NO_OWNER:
        return False
    user_id = str(user_id)
    try:
        with SessionLocal() as db:
            session = db.query(ChatSession).filter(
                ChatSession.session_id == session_id
            ).first()
            return bool(
                session
                and session.user_id is not None
                and session.user_id == user_id
            )
    except SQLAlchemyError as e:
        logger.error("Ownership check failed for session %s: %s", session_id, e)
        return False