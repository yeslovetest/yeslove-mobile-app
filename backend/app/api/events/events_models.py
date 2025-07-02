from .events_routes import api
from flask_restx import fields

EventsQuery = api.model("EventsQuery", {
    "start_time": fields.String(required=False, description="Start time filter in ISO format"),
    "end_time": fields.String(required=False, description="End time filter in ISO format"),
    "page": fields.Integer(required=False, description="Page Number, default = 1"),
    "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
}
                        )

EventInfoQuery = api.model("EventInfoQuery", {
    "event_ids": fields.List(fields.Integer, required=True, description="takes list of Ids for event to be fetched"),
    "page": fields.Integer(required=False, description="Page Number, default = 1"),
    "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
})

AddEventRequest = api.model("AddEventRequest", {
    "name": fields.String(required=True, description="Name of the event"),
    "description": fields.String(description="Description about the event"),
    "location": fields.String(description="Description of the event location i.e second floor conference room"),
    "event_time": fields.String(required=True, description="Date and time of event in ISO format"),
    "creator_attending": fields.Boolean(),
    "address_id": fields.Integer(description="Address ID for if the address is already in the database"),
    "address_number": fields.String(description="House number (or name) for address"),
    "address_street": fields.String(description="Street Name"),
    "address_city": fields.String(description="City"),
    "address_county": fields.String(description="County"),
    "address_country": fields.String(description="Country, (UK by default)"),
    "post_code": fields.String(description="post code")
})

AddAttendeeRequest = api.model("AddAttendeeRequest", {
    "user_id": fields.Integer(required=False, description="User ID to be added, will default to user that made the request"),
    "event_id": fields.Integer(required=True, description="ID of event to add attendee to")
})

RemoveAttendeeRequest = api.model("RemoveAttendeeRequest", {
    "user_id": fields.Integer(required=False, description="User ID to be removed, will default to user that made the request"),
    "event_id": fields.Integer(required=True, description="ID of event to remove attendee from")
})

AttendingQuery = api.model("AttendingQuery", {
    "user_id": fields.Integer(required=False, description="User ID of attendee to find events for, will default to user "
                                                          "that made the request"),
    "type": fields.String(required=True, description="Type of request, attending/attended/all, defaults to 'all', showing "
                                                     "all events for which the user is an attendee, 'attending' returns "
                                                     "all upcoming events for which the user is an attendee, 'attended' "
                                                     "returns all past events attended by the user"),
    "page": fields.Integer(required=False, description="Page Number, default = 1"),
    "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
})


CreatedEventsQuery = api.model("AttendingQuery", {
    "user_id": fields.Integer(required=False, description="User ID of creator to find events for, will default to user "
                                                          "that made the request"),
    "type": fields.String(required=True, description="Type of request, upcoming/past/all, defaults to 'all'"),
    "page": fields.Integer(required=False, description="Page Number, default = 1"),
    "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
})

