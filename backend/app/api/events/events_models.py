from .events_routes import api
from flask_restx import fields

AddressModelResponse = api.model("AddressModelResponse", {
    "number": fields.String,
    "street": fields.String,
    "city": fields.String,
    "county": fields.String,
    "country": fields.String,
    "post_code": fields.String
})

EventModelResponse = api.model("EventsModelResponse", {
    "id": fields.Integer(description="Event ID"),
    "name": fields.String(description="Event name"),
    "description": fields.String(description="Event description"),
    "location": fields.String(description="Event location"),
    "event_time": fields.String(description="Event time in ISO 8601"),
    "image_url": fields.String(description="Event image URL"),
    "address": fields.Nested(AddressModelResponse, description="Event address details"),
    "is_attending": fields.Boolean(description="Is the current user attending the event"),
    "attendees": fields.List(fields.Integer, description="List of attendee user IDs")
})

EventListResponse = api.model("EventListResponse", {
    "items": fields.List(fields.Nested(EventModelResponse), description="List of events"),
    "total": fields.Integer(description="Total number of events"),
    "page": fields.Integer(description="Current page"),
    "per_page": fields.Integer(description="Events per page")
})


EventsQuery = api.model("EventsQuery", {
    "start_time": fields.String(required=False, description="Start time filter in ISO format"),
    "end_time": fields.String(required=False, description="End time filter in ISO format"),
    "page": fields.Integer(required=False, description="Page Number, default = 1"),
    "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
})

EventsResponse = api.model("EventsResponse", {
    "event_ids": fields.List(fields.Integer, description="List of Event IDs"),
    "total_events": fields.Integer(description="total number of events meeting query"),
    "total_pages": fields.Integer(description="total number of pages meeting the query"),
    "current_page": fields.Integer(description="current page number"),
    "per_page": fields.Integer(description="number of events per page")
})

EventInfoQuery = api.model("EventInfoQuery", {
    "event_ids": fields.List(fields.Integer, required=True, description="takes list of Ids for event to be fetched"),
    "page": fields.Integer(required=False, description="Page Number, default = 1"),
    "per_page": fields.Integer(required=False, description="Number of Events per page, default = 20")
})

EventInfoResponse = api.model("EventInfoResponse", {
    "event_infos": fields.List(fields.Nested(EventModelResponse), description="List of Events"),
    "total_events": fields.Integer(description="total number of events meeting query"),
    "total_pages": fields.Integer(description="total number of pages meeting the query"),
    "current_page": fields.Integer(description="current page number"),
    "per_page": fields.Integer(description="number of events per page")
})

AddEventRequest = api.model("AddEventRequest", {
    "name": fields.String(required=True, description="Name of the event"),
    "description": fields.String(description="Description about the event"),
    "location": fields.String(description="Description of the event location i.e second floor conference room"),
    "event_time": fields.String(required=True, description="Date and time of event in ISO format"),
    "creator_attending": fields.Boolean(),
    "image": fields.Raw(required=False, description="Event image file (will be uploaded to object storage)"),
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

UpdateEventRequest = api.model("UpdateEventRequest", {
    "name": fields.String(required=False, description="Event name"),
    "description": fields.String(required=False, description="Event description"),
    "location": fields.String(required=False, description="Event location"),
    "event_time": fields.String(required=False, description="Event datetime in ISO format"),
    "image": fields.Raw(required=False, description="Event image file (will be uploaded to object storage)")
})

ProfessionalResponse = api.model("ProfessionalResponse", {
    "id": fields.Integer(description="User ID"),
    "keycloak_id": fields.String(description="Keycloak ID"),
    "username": fields.String(description="Username"),
    "email": fields.String(description="Email"),
    "bio": fields.String(description="Bio"),
    "profile_pic": fields.String(description="Profile picture URL"),
    "specialization": fields.String(description="Professional specialization"),
    "license_body": fields.String(description="License body (BACP, HCPC, etc.)")
})

ProfessionalsListResponse = api.model("ProfessionalsListResponse", {
    "professionals": fields.List(fields.Nested(ProfessionalResponse)),
    "pagination": fields.Raw(description="Pagination info")
})
