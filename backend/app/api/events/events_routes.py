import logging

from flask import request
from flask_restx import Namespace, Resource, reqparse

from app.logging_setup import setup_logger

from app.utils import require_auth

from datetime import datetime

# create a logger instance 
logger = setup_logger()

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


    # get event ids
    @api.expect(EventsQuery)
    @api.response(code=200, description="Success", model=EventsResponse)
    def get(self):
        from app.models import Event
        try:
            #change this to JSON for consistency
            logging.info("attempting to get request arguments")
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


    # get event info
    @api.expect(EventInfoQuery)
    @api.response(code=200, description="Success", model=EventInfoResponse)
    @api.doc(description="Retrieve detailed info for one or more events by their IDs. Supports pagination.")
    def get(self):
        from app.models import User, Address, Event
        try:
            logging.info("Attempting to get Event")

            logging.info("Getting request")
            data = request.json
            event_ids = data.get("event_ids")
            page = int(data.get("page", 1))
            per_page = int(data.get("per_page", 20))

            if not event_ids:
                return {"message": "event_ids parameter is required"}, 400

            event_ids = [int(id_) for id_ in event_ids]

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


    # create new event
    @require_auth()
    @api.expect(AddEventRequest)
    @api.doc(description="""Add event to events table,
                        Can take an address id if the address is already within in the database,
                        otherwise can be added line by line. Address isn't required to allow for online events.
                        Image will be uploaded to S3 if provided.
                         """)
    @api.response(201, "Success")
    def post(self):
        from app.models import User, Address, Event, db

        logger.info("Attempting to create new event")

        logger.info("Getting request...")
        data = request.json
        creator = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        logger.info("Verifying creator...")
        if not creator:
            return {"message": "User not found"}, 404

        if data.get("address_id"):
            logger.info("Checking for address in system")
            event_address = Address.query.filter_by(id=data.get("address_id")).first()
            if not event_address:
                return {"message": "Address id does not exist"}, 400
        elif data.get("address_number"):
            logger.info("Creating address")
            
            # Validate address fields
            from .address_validation import validate_address_fields
            is_valid, validation_message = validate_address_fields(data)
            if not is_valid:
                return {"message": validation_message}, 400
            
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
            logger.info("No address given")
            event_address = None

        logger.info("Getting event name")
        if not data.get("name"):
            return {"message": "Event name cannot be empty"}, 400

        logger.info("Getting event time")
        if not data.get("event_time"):
            return {"message": "Event must have a datetime in ISO format"}, 400

        logger.info("Trying to parse ISO datetime")
        try:
            event_datetime = parse_iso_datetime(data.get("event_time"))
        except Exception:
            return {"message": "Invalid datetime format. Use ISO format."}, 400

        logger.info("Creating Event")
        
        # Handle image upload to S3 if provided
        image_url = None
        if 'image' in request.files:
            from app.services.media.media_service import MediaService
            try:
                upload_result = MediaService.upload_file(
                    file=request.files['image'],
                    user_id=creator.id,
                    folder='events'
                )
                image_url = upload_result.get('s3_url') if upload_result else None
                logger.info(f"Event image uploaded to S3: {image_url}")
            except Exception as e:
                logger.error(f"Image upload failed: {e}")
                # Continue without image rather than failing
        
        event = Event(
            name=data.get("name"),
            description=data.get("description"),
            location=data.get("location"),
            event_time=event_datetime,
            creator_id=creator.id,
            address=event_address,
            address_id=event_address.id if event_address else None,
            image_url=image_url  # S3 URL stored in PostgreSQL
        )

        logger.info("Adding event to database")
        db.session.add(event)

        logger.info("Checking if creator attending")
        if data.get("creator_attending"):
            event.attendees.append(creator)

        logger.info("Commiting database changes")
        db.session.commit()
        
        # Send push notification to all followers about new event
        from app.models import Follow
        from app.services.push_notification_service import PushNotificationService
        
        follower_links = Follow.query.filter_by(followed_id=creator.id).all()
        follower_user_ids = [f.follower_id for f in follower_links]
        
        if follower_user_ids:
            try:
                PushNotificationService.send_to_multiple_users(
                    user_ids=follower_user_ids,
                    title="New Event",
                    body=f"{creator.username} created: {event.name}",
                    data={"type": "new_event", "event_id": event.id},
                    notification_type="events"
                )
            except Exception as e:
                logger.error(f"Event notification failed: {e}")

        return {"message": "Event created successfully"}, 201


@api.route("/events_list")
class EventList(Resource):
    """Lists events with optional pagination and date range filter"""

    from .events_models import EventModelResponse, EventListResponse

    @require_auth()
    @api.doc(description="List events with pagination and optional date range filter")
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Events per page (default 10, max 100)", type="integer")
    @api.param("start_date", "Start date for filtering (YYYY-MM-DD, defaults to today)", type="string")
    @api.param("end_date", "End date for filtering (YYYY-MM-DD)", type="string")
    @api.response(200, "Success", EventListResponse)
    @api.marshal_with(EventListResponse)
    def get(self):
        from app.models import Event, User
        from datetime import datetime, date

        # Get logged-in user
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        # Pagination setup
        try:
            page = max(int(request.args.get("page", 1)), 1)
        except ValueError:
            page = 1

        try:
            per_page = int(request.args.get("per_page", 10))
        except ValueError:
            per_page = 10

        per_page = max(1, min(per_page, 100))

        # Date filters
        start_date_str = request.args.get("start_date")
        end_date_str = request.args.get("end_date")

        query = Event.query

        # Apply date range filter
        if start_date_str or end_date_str:
            try:
                # Default start date = today if not provided
                if start_date_str:
                    start = datetime.strptime(start_date_str, "%Y-%m-%d")
                else:
                    today = date.today()
                    start = datetime.combine(today, datetime.min.time())

                if end_date_str:
                    end = datetime.combine(
                        datetime.strptime(end_date_str, "%Y-%m-%d"), datetime.max.time()
                    )
                else:
                    end = datetime.max

                query = query.filter(Event.event_time >= start, Event.event_time <= end)
            except ValueError:
                pass
        else:
            # Default behavior if no params — show from today onwards
            today = date.today()
            start = datetime.combine(today, datetime.min.time())
            query = query.filter(Event.event_time >= start)

        # Sort by upcoming first
        query = query.order_by(Event.event_time.asc())

        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        events = pagination.items

        # Add is_attending flag for each event
        items = []
        for event in events:
            event_dict = event.to_dict()
            event_dict["is_attending"] = any(u.id == user.id for u in event.attendees)
            items.append(event_dict)

        return {
            "items": items,
            "total": pagination.total,
            "page": page,
            "per_page": per_page
        }, 200



@api.route("/event_attendees")
class EventAttendees(Resource):
    from .events_models import AddAttendeeRequest, AttendingQuery, EventsResponse


    # add attendee
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


@api.route("/event_attendees/attending")
class AttendingEvents(Resource):
    """Lists events a user is attending or has attended"""

    from .events_models import EventModelResponse, EventListResponse

    @require_auth()
    @api.doc(description="""
        Returns events (with details) the given user is attending, has attended, or both.
        Results are paginated, and can be filtered by start_date and end_date.
        
        - For `attended`: end_date defaults to today (cannot exceed today)
        - For `attending`: start_date defaults to today (cannot be earlier than today)
    """)
    @api.param("user_id", "User ID (defaults to authenticated user)", type="integer")
    @api.param("type", "Event type filter: attending (future), attended (past), or all", type="string", default="all")
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Events per page (default 10, max 100)", type="integer")
    @api.param("start_date", "Filter start date (YYYY-MM-DD)", type="string")
    @api.param("end_date", "Filter end date (YYYY-MM-DD)", type="string")
    @api.response(200, "Success", EventListResponse)
    @api.response(400, "Invalid request")
    @api.response(404, "User not found")
    @api.marshal_with(EventListResponse)
    def get(self):
        from app.models import Event, User
        from datetime import datetime, date, timedelta

        data = request.args
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        # Defaults
        user_id = int(data.get("user_id", user.id))
        request_type = data.get("type", "all").lower()
        page = max(int(data.get("page", 1)), 1)
        per_page = max(1, min(int(data.get("per_page", 20)), 100))

        start_date_str = data.get("start_date")
        end_date_str = data.get("end_date")

        valid_types = {"attending", "attended", "all"}
        if request_type not in valid_types:
            return {"message": "Invalid type. Must be one of: attending, attended, all"}, 400

        attendee = User.query.filter_by(id=user_id).first()
        if not attendee:
            return {"message": "User not found"}, 404

        # Base query: all events the user is attending
        query = Event.query.join(Event.attendees).filter(User.id == user_id)

        now = datetime.utcnow()
        today = date.today()

        # Parse dates safely
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
        except ValueError:
            return {"message": "Invalid start_date format. Use YYYY-MM-DD."}, 400

        try:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
        except ValueError:
            return {"message": "Invalid end_date format. Use YYYY-MM-DD."}, 400

        # Apply event type logic and date bounds
        if request_type == "attended":
            # Past events only — end_date cannot exceed today
            if not end_date or end_date.date() > today:
                end_date = datetime.combine(today, datetime.max.time())
            if not start_date:
                start_date = datetime.min
            query = query.filter(Event.event_time <= end_date)
            if start_date:
                query = query.filter(Event.event_time >= start_date)

        elif request_type == "attending":
            # Future events only — start_date cannot be before today
            if not start_date or start_date.date() < today:
                start_date = datetime.combine(today, datetime.min.time())
            if not end_date:
                end_date = datetime.max
            query = query.filter(Event.event_time >= start_date)
            if end_date:
                query = query.filter(Event.event_time <= end_date)

        else:  # "all"
            if start_date and end_date:
                query = query.filter(Event.event_time >= start_date, Event.event_time <= end_date)
            elif start_date:
                query = query.filter(Event.event_time >= start_date)
            elif end_date:
                query = query.filter(Event.event_time <= end_date)

        # Order events
        if request_type == "attending":
            query = query.order_by(Event.event_time.asc())
        else:
            query = query.order_by(Event.event_time.desc())

        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        events = [event.to_dict() for event in pagination.items]

        return {
            "items": events,
            "total": pagination.total,
            "page": page,
            "per_page": per_page
        }, 200



@api.route("/event_attendees/remove")
class RemoveAttendee(Resource):
    from .events_models import RemoveAttendeeRequest

    # remove attendee
    @require_auth()
    @api.expect(RemoveAttendeeRequest)
    @api.doc(description="Remove a user from an event's attendees list")
    @api.response(204, "Success")
    def delete(self):
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

        return {"message": "User removed from event successfully"}, 204

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




@api.route("/event_info/<int:event_id>")
class EventManagement(Resource):
    from .events_models import UpdateEventRequest
    
    @require_auth()
    @api.expect(UpdateEventRequest)
    @api.doc(description="Update event data - only event creator can edit")
    def put(self, event_id):
        """Edit event data"""
        from app.models import User, Event, Address, db
        
        data = request.json or {}
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        
        if not user:
            return {"message": "User not found"}, 404
        
        event = Event.query.get_or_404(event_id)
        
        # Only creator can edit event
        if event.creator_id != user.id:
            return {"message": "Only event creator can edit this event"}, 403
        
        try:
            # Update basic event fields
            if data.get("name"):
                event.name = data.get("name")
            if data.get("description"):
                event.description = data.get("description")
            if data.get("location"):
                event.location = data.get("location")
            if data.get("event_time"):
                event.event_time = parse_iso_datetime(data.get("event_time"))
            if data.get("image_url"):
                event.image_url = data.get("image_url")
            
            db.session.commit()
            return {"message": "Event updated successfully"}, 200
            
        except Exception as e:
            logger.error(f"Error updating event: {e}")
            db.session.rollback()
            return {"message": "Error updating event"}, 500
    
    @require_auth()
    @api.doc(description="Delete event - only event creator can delete")
    def delete(self, event_id):
        """Delete event"""
        from app.models import User, Event, db
        
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        
        if not user:
            return {"message": "User not found"}, 404
        
        event = Event.query.get_or_404(event_id)
        
        # Only creator can delete event
        if event.creator_id != user.id:
            return {"message": "Only event creator can delete this event"}, 403
        
        try:
            db.session.delete(event)
            db.session.commit()
            return {"message": "Event deleted successfully"}, 200
            
        except Exception as e:
            logger.error(f"Error deleting event: {e}")
            db.session.rollback()
            return {"message": "Error deleting event"}, 500


@api.route("/professionals")
class GetProfessionals(Resource):
    """Lists verified professionals for the event page/Get-help page"""

    from .events_models import ProfessionalsListResponse

    @api.doc(description="Get a paginated list of verified professionals for the event page/Get-help page")
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Professionals per page (default 20, max 100)", type="integer")
    @api.response(200, "Success", ProfessionalsListResponse)
    @api.response(500, "Internal server error")
    def get(self):
        """Retrieve verified professionals with pagination"""
        from app.models import User, ProfessionalDetails

        try:
            # Query parameters
            try:
                page = max(int(request.args.get("page", 1)), 1)
            except ValueError:
                page = 1

            try:
                per_page = int(request.args.get("per_page", 20))
            except ValueError:
                per_page = 20

            per_page = max(1, min(per_page, 100))

            # Query for users with verified professional details
            query = (
                User.query.join(ProfessionalDetails)
                .filter(ProfessionalDetails.is_verified == True)
                .order_by(User.username)
            )

            paginated_professionals = query.paginate(
                page=page, per_page=per_page, error_out=False
            )

            professionals = [
                {
                    "id": user.id,
                    "keycloak_id": user.keycloak_id,
                    "username": user.username,
                    "email": user.email,
                    "bio": user.bio,
                    "profile_pic": user.profile_pic_url,
                    "specialization": user.professional_details.specialization,
                    "license_body": user.professional_details.license_body,
                }
                for user in paginated_professionals.items
            ]

            return {
                "professionals": professionals,
                "pagination": {
                    "page": paginated_professionals.page,
                    "per_page": paginated_professionals.per_page,
                    "total_professionals": paginated_professionals.total,
                    "total_pages": paginated_professionals.pages,
                    "has_next": paginated_professionals.has_next,
                    "has_prev": paginated_professionals.has_prev,
                },
            }, 200

        except Exception as e:
            logger.error(f"Error fetching professionals: {e}")
            return {"message": "Error fetching professionals"}, 500

