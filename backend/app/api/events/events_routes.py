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


@api.route("/event_ids")
@api.doc(
    description="Retrieve events IDs in a given date range, if no params given returns first page of all upcoming IDs. "
                "Supports pagination.")
class EventIds(Resource):
    from .events_models import EventsQuery, EventsResponse

    @api.expect(EventsQuery)
    @api.response(code=200, description="Success", model=EventsResponse)
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
                pagination = Event.query.with_entities(Event.id).filter(
                    Event.event_time > start_time,
                    Event.event_time < end_time
                ).paginate(page=page, per_page=per_page)
            else:
                pagination = Event.query.with_entities(Event.id).filter(Event.event_time > start_time).paginate(
                    page=page,
                    per_page=per_page)

            upcoming_ids = pagination.items
            total = pagination.total
            pages = pagination.pages

            result = [event_id for (event_id,) in upcoming_ids]
            return {"event_ids": result,
                    "total_events": total,
                    "total_pages": pages,
                    "current_page": page,
                    "per_page": per_page
                    }, 200

        except Exception as e:
            logger.error(f"Error getting event ids {e}")
            return {"message": "Error getting event ids"}, 500


@api.route("/event_info")
class EventInfo(Resource):
    from .events_models import EventInfoQuery, AddEventRequest, EventInfoResponse

    @api.expect(EventInfoQuery)
    @api.response(code=200, description="Success", model=EventInfoResponse)
    @api.doc(description="Retrieve detailed info for one or more events by their IDs. Supports pagination.")
    def get(self):
        from app.models import User, Address, Event
        try:
            event_ids = request.args.getlist("event_ids")
            if not event_ids:
                return {"message": "event_ids parameter is required"}, 400

            event_ids = [int(id_) for id_ in event_ids]

            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))

            pagination = Event.query.filter(Event.id.in_(event_ids)).paginate(page=page, per_page=per_page)
            events = pagination.items
            total = pagination.total
            pages = pagination.pages

            return {"event_infos": [event.to_dict() for event in events],
                    "total_events": total,
                    "total_pages": pages,
                    "current_page": page,
                    "per_page": per_page
                    }, 200

        except Exception as e:
            logger.error(f"Error getting event information {e}")
            return {"message": "Error getting event information"}, 500

    @require_auth()
    @api.expect(AddEventRequest)
    @api.doc(description="""Add event to events table,
                        Can take an address id if the address is already within in the database,
                        otherwise can be added line by line. Address isn't required to allow for online events.
                        
                         
                         """)
    @api.response(201, "Success")
    def post(self):
        from app.models import User, Address, Event, db

        data = request.json
        creator = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        if not creator:
            return {"message": "User not found"}, 404

        if data.get("address_id"):
            event_address = Address.query.filter_by(id=data.get("address_id")).first()
            if not event_address:
                return {"message": "Address id does not exist"}, 400
        elif data.get("address_number"):
            country = data.get("address_country") or "UK"
            event_address = Address(
                number=data.get("address_number"),
                street=data.get("address_street"),
                city=data.get("address_city"),
                county=data.get("address_county"),
                country=country,
                post_code=data.get("post_code")
            )
            db.session.add(event_address)
            db.session.flush()
        else:
            event_address = None

        if not data.get("name"):
            return {"message": "Event name cannot be empty"}, 400

        if not data.get("event_time"):
            return {"message": "Event must have a datetime in ISO format"}, 400

        try:
            event_datetime = parse_iso_datetime(data.get("event_time"))
        except Exception:
            return {"message": "Invalid datetime format. Use ISO format."}, 400

        event = Event(
            name=data.get("name"),
            description=data.get("description"),
            location=data.get("location"),
            event_time=event_datetime,
            creator_id=creator.id,
            address=event_address,
            address_id=event_address.id if event_address else None
        )

        db.session.add(event)

        if data.get("creator_attending"):
            event.attending.append(creator)

        db.session.commit()

        return {"message": "Event created successfully"}, 201


@api.route("/event_attendees")
class EventAttendees(Resource):
    from .events_models import AddAttendeeRequest, AttendingQuery, EventsResponse

    @require_auth()
    @api.expect(AddAttendeeRequest)
    @api.doc(description="""
    """)
    @api.response(201, "Success")
    def post(self):
        from app.models import User, Event, db

        data = request.json
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        if not data.get("user_id"):
            attendee = user
        else:
            user_id = data.get("user_id")
            attendee = User.query.filter_by(id=user_id).first()
            if not attendee:
                return {"message": "provided user ID does not exist"}, 400

        event_id = data.get("event_id")

        if not data.get("event_id"):
            return {"message": "Event ID must be provided"}, 400

        event = Event.query.filter_by(id=event_id).first()
        if not event:
            return {"message": "Event does not exist"}, 404

        if attendee in event.attendees:
            return {"message": "User is already attending this event"}, 400

        event.attending.append(attendee)

        db.session.commit()

        return {"message": "User added to event successfully"}, 201

    @require_auth()
    @api.expect(AttendingQuery)
    @api.doc(description="""Returns Event IDs of all events to be attended/already attended by the provided user id)
    """)
    @api.response(200, "Success", EventsResponse)
    def get(self):
        from app.models import Event, User

        data = request.args
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        user_id = data.get("user_id", user.id)
        request_type = data.get("type", "all").lower()
        page = int(data.get("page", 1))
        per_page = int(data.get("per_page", 20))

        valid_types = {"attending", "attended", "all"}
        if request_type not in valid_types:
            return {"message": "Invalid type. Must be one of: attending, attended, all"}, 400

        attendee = User.query.filter_by(id=user_id).first()
        if not attendee:
            return {"message": "User not found"}, 404

        query = Event.query.join(Event.attending).filter(User.id == user_id)
        query = query.order_by(Event.event_time.desc())

        now = datetime.utcnow()
        if request_type == "attending":
            query = query.filter(Event.event_time > now)
        elif request_type == "attended":
            query = query.filter(Event.event_time < now)

        pagination = query.paginate(page=page, per_page=per_page)
        events = pagination.items

        return {
            "event_ids": [event.id for event in events],
            "total_events": pagination.total,
            "total_pages": pagination.pages,
            "current_page": page,
            "per_page": per_page
        }, 200

@api.route("/event_attendees/remove")
class RemoveAttendee(Resource):
    from .events_models import RemoveAttendeeRequest

    @require_auth()
    @api.expect(RemoveAttendeeRequest)
    @api.doc(description="Remove a user from an event's attendees list")
    @api.response(201, "Success")
    def post(self):
        from app.models import User, Event, db

        data = request.json
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        user_id = data.get("user_id", user.id)
        event_id = data.get("event_id")

        if not event_id:
            return {"message": "Event ID must be provided"}, 400

        event = Event.query.filter_by(id=event_id).first()
        if not event:
            return {"message": "Event not found"}, 404

        attendee = User.query.filter_by(id=user_id).first()
        if not attendee:
            return {"message": "User not found"}, 404

        if attendee not in event.attending:
            return {"message": "User is not attending this event"}, 400

        event.attending.remove(attendee)
        db.session.commit()

        return {"message": "User removed from event successfully"}, 201

@api.route("/created_events")
class CreatedEvents(Resource):
    from .events_models import CreatedEventsQuery, EventsResponse

    @require_auth()
    @api.expect(CreatedEventsQuery)
    @api.doc(description="""Returns list of event ids created by the given user ID (defaults to account making the 
                            request). Can specify type as 'upcoming', 'past' and 'all'.
                         """)
    @api.response(200, "Success", EventsResponse)
    def get(self):
        from app.models import User, Event

        data = request.args
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        user_id = data.get("user_id", user.id)
        request_type = data.get("type", "all").lower()
        page = int(data.get("page", 1))
        per_page = int(data.get("per_page", 20))

        valid_types = {"upcoming", "past", "all"}
        if request_type not in valid_types:
            return {"message": "Invalid type. Must be one of: upcoming, past, all"}, 400

        creator = User.query.filter_by(id=user_id).first()
        if not creator:
            return {"message": "User not found"}, 404

        query = Event.query.filter(Event.creator_id == user_id)
        query = query.order_by(Event.event_time.desc())

        now = datetime.utcnow()
        if request_type == "upcoming":
            query = query.filter(Event.event_time > now)
        elif request_type == "past":
            query = query.filter(Event.event_time < now)

        pagination = query.paginate(page=page, per_page=per_page)
        events = pagination.items

        return {
            "event_ids": [event.id for event in events],
            "total_events": pagination.total,
            "total_pages": pagination.pages,
            "current_page": page,
            "per_page": per_page
        }, 200




    # to do:
    # put to edit event data
    # add image functionality
