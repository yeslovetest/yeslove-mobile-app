from flask import request
from flask_restx import Namespace, Resource, reqparse

from app.logging_setup import logger

from app.utils import require_auth

from datetime import datetime

api = Namespace("events", description="API Endpoints")

def parse_iso_datetime(dt_str):
    if dt_str.endswith('Z'):
        dt_str = dt_str[:-1] + '+00:00'
    return datetime.fromisoformat(dt_str)

@api.route("/events")
class Events(Resource):
    from .events_models import EventsRequest
    @require_auth()
    @api.expect(EventsRequest)
    def get(self):
        from app.models import Event
        try:
            start_time_str = request.args.get("start_time")
            end_time_str = request.args.get("end_time")
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))

            if start_time_str:
                start_time = parse_iso_datetime(start_time_str)
            else:
                start_time = datetime.utcnow()

            if end_time_str:
                end_time = parse_iso_datetime(end_time_str)
                upcoming_ids = Event.query.with_entities(Event.id).filter(
                    Event.datetime > start_time,
                    Event.datetime < end_time
                ).paginate(page=page, per_page=20)
            else:
                upcoming_ids = Event.query.with_entities(Event.id).filter(Event.datetime > start_time).paginate(page=page, per_page=20)
            result = [event_id for (event_id,) in upcoming_ids]
            return{"upcoming_event_ids": result}, 200
        except Exception as e:
            logger.error(f"Error getting event ids {e}")
            return{"message": "Error getting event ids"}, 500