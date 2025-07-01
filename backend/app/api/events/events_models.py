from .events_routes import api
from flask_restx import fields

EventsRequest = api.model("EventsRequest", {
        "start_time": fields.String(required=False, description="Start time filter in ISO format"),
        "end_time": fields.String(required=False, description="End time filter in ISO format"),
        "page": fields.Integer(required=False, description="Page Number, default = 1"),
        "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
    }
)