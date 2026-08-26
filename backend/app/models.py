import uuid
import json
from flask_sqlalchemy import SQLAlchemy
from pgvector.sqlalchemy import Vector
from datetime import datetime
from app import db  # ✅ Import the same db instance

# Association table for event attendees
event_attendees = db.Table('attendees',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('event_id', db.Integer, db.ForeignKey('event.id'), primary_key=True)
)

# -------------------------
# 🚀 User Model (Keycloak Integrated)
# -------------------------
class User(db.Model):
    id              = db.Column(db.Integer, primary_key=True)
    keycloak_id     = db.Column(db.String(255), unique=True, nullable=False, index=True)  # ✅ Store Keycloak's `sub`
    username        = db.Column(db.String(50), unique=True, nullable=False)
    email           = db.Column(db.String(100), unique=True, nullable=False)
    phone_number    = db.Column(db.String(20), nullable=True)
    address         = db.Column(db.String(255), nullable=True)
    website         = db.Column(db.String(255), nullable=True)
    birthday        = db.Column(db.Date, nullable=True)  # Store as date
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Track user creation time
    bio             = db.Column(db.String(250), default="")
    profile_pic_url = db.Column(db.String(500), nullable=True)  # Object storage URL for profile pictures
    user_type       = db.Column(db.String(20), default="standard")  # ✅ Defaulgt to "standard" or "professional"


    # ✅ Relationships
    posts       = db.relationship("Post", backref="author", lazy=True, cascade="all, delete-orphan")
    followers   = db.relationship("Follow", foreign_keys="[Follow.followed_id]", backref="followed", lazy=True)
    following   = db.relationship("Follow", foreign_keys="[Follow.follower_id]", backref="follower", lazy=True)
    created_events = db.relationship("Event", foreign_keys="[Event.creator_id]", back_populates="creator", lazy=True)
    attending_events = db.relationship("Event", secondary=event_attendees, back_populates="attendees")

    # ✅ One-to-One Relationship with ProfessionalDetails
    professional_details = db.relationship(
        "ProfessionalDetails", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    # Warning and suspension to user
    warnings = db.Column(db.Integer, default=0)
    is_suspended = db.Column(db.Boolean, default=False)

# -------------------------
# 🚀 Professional Details Model (One-to-One Relationship with User..)
# -------------------------
class ProfessionalDetails(db.Model):

    __tablename__ = "professional_details"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    license_body = db.Column(
        db.String(20),
        nullable=True,
        comment="HCPC, BACP or UKCP"
    )

    license_number = db.Column(
        db.String(100),
        nullable=True,
        comment="Professional license/registration number"
    )

    consent_license_data = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        comment="User consented to use and display license data"
    )

    specialization = db.Column(db.String(200), nullable=True)

    # Admin fields 
    is_verified = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        comment="Has an admin approved this license?"
    )

    verified_at = db.Column(
        db.DateTime,
        nullable=True,
        comment="When the admin clicked Approve"
    )

    next_reverify_date = db.Column(
        db.Date, 
        nullable=True,
        comment="Date to send next reminder"
    )

    license_expiry_date = db.Column(
        db.Date,
        nullable=True,
        comment="Offical expirey if known"
    )

    # ✅ Relationship to User
    user = db.relationship(
        "User",
        back_populates="professional_details",
        single_parent=True  # ✅ Ensure only one `ProfessionalDetails` per `User`
    )

# -------------------------
# 🚀 Post Model
# -------------------------
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)  # Object storage URL for post images (if any)
    video_url = db.Column(db.String(500), nullable=True) 
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Added timestamp
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    status = db.Column(db.String(20), default="visible")  # visible, removed, flagged
    is_anonymous = db.Column(db.Boolean, default=False) # specify if Post is Anonymous
    # ✅ Relationships
    comments = db.relationship("Comment", backref="post", lazy=True, cascade="all, delete-orphan")
    likes = db.relationship("Like", backref="post", lazy=True, cascade="all, delete-orphan")
    # one-to-many relationship with Media
    media_files = db.relationship("Media", backref="post", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "author": self.author.username if self.author else "Unknown",
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


# -------------------------
# 🚀 Comment Model
# -------------------------
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Added timestamp
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id", ondelete="CASCADE"), nullable=False, index=True)

    user = db.relationship('User', backref='comments')


# -------------------------
# 🚀 Like Model (Prevent Duplicate Likes)
# -------------------------
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id", ondelete="CASCADE"), nullable=False, index=True)

    # ✅ Unique Constraint (Prevent duplicate likes)
    __table_args__ = (db.UniqueConstraint("user_id", "post_id", name="unique_like"),)


# -------------------------
# 🚀 Follow Model (Prevent Duplicate Follows)
# -------------------------
class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    followed_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    follow_type = db.Column(db.String(10), default="basic")  # basic or friend

    # ✅ Unique Constraint (Prevent duplicate follows)
    __table_args__ = (db.UniqueConstraint("follower_id", "followed_id", name="unique_follow"),)

# -------------------------
# 🚀 Chat Model
# -------------------------
class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    message = db.Column(db.Text, nullable=True)
    media_id = db.Column(db.String(36), db.ForeignKey("media.id"), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    opened = db.Column(db.Boolean, default=False)
    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])
    media = db.relationship("Media", backref="chat_messages")

    # ✅ Prevent users from messaging themselves and ensure message or media exists
    __table_args__ = (
        db.CheckConstraint("sender_id != receiver_id", name="check_no_self_message"),
        db.CheckConstraint("message IS NOT NULL OR media_id IS NOT NULL", name="check_message_or_media")
    )

class EmailNotificationSettings(db.Model):
    __tablename__ = "email_notification_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("user.keycloak_id"), nullable=False)
    setting_id = db.Column(db.String, nullable=False)
    value = db.Column(db.Boolean, default=True)


class ProfileVisibilitySettings(db.Model):
    __tablename__ = "profile_visibility_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("user.keycloak_id"), nullable=False)
    setting_id = db.Column(db.String, nullable=False)
    value = db.Column(db.String, nullable=False)  # e.g., "visible", "hidden"
    category = db.Column(db.String, nullable=False)  # "Contact" or "Education And Other Information"


class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    reaction_type = db.Column(db.String(50), nullable=False)  # like, love, laugh, angry, etc.

    # Relationships 
    user = db.relationship("User", backref="reactions")
    post = db.relationship("Post", backref="reactions")

# ------------------
# Event Model
# ------------------
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100), nullable=False)
    event_time = db.Column(db.DateTime, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)  # Event image
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey("address.id", ondelete='SET NULL'))  # nullable as could be online?
    
    # relationships
    creator = db.relationship('User', back_populates='created_events')
    address = db.relationship('Address', back_populates='events')

    # Attendees many-many relationship
    attendees = db.relationship('User', secondary=event_attendees, back_populates="attending_events")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "location": self.location,
            "event_time": self.event_time.isoformat(),
            "creator_id": self.creator_id,
            "image_url": self.image_url,
            "address": self.address.to_dict() if self.address else None,
            "attendees": [user.id for user in self.attendees]
        }

# -------------------------------
# Address model (used for event locations)
# -------------------------------
class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(100), nullable=False)  # str to support house names
    street = db.Column(db.String, nullable=False)
    city = db.Column(db.String, nullable=False)
    county = db.Column(db.String)  # doesn't really need to be specified
    country = db.Column(db.String)  # if left blank assume UK
    post_code = db.Column(db.String, nullable=False)

    events = db.relationship('Event', back_populates='address', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "number": self.number,
            "street": self.street,
            "city": self.city,
            "county": self.county,
            "country": self.country,
            "post_code": self.post_code
        }

# ------------------------- Create BlogPost Model -------------------------
class BlogPost(db.Model):
    __tablename__ = "blog_posts"
    id = db.Column(db.Integer, primary_key=True)
    wp_post_id = db.Column(db.Integer, unique=True, nullable=True, index=True)
    source = db.Column(db.String(50), default="local", index=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(500))  # Optional image
    summary = db.Column(db.String(1000))
    status = db.Column(db.String(50))
    slug = db.Column(db.String(255))
    link = db.Column(db.String(1000))
    modified_at = db.Column(db.DateTime)
    synced_at = db.Column(db.DateTime)
    # Relationships 
    author = db.relationship("User", backref="blogs")
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "author": self.author.username if self.author else "YesLove",
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "wp_post_id": self.wp_post_id,
            "source": self.source,
            "summary": self.summary,
            "image_url": self.image_url,
            "status": self.status,
            "slug": self.slug,
            "link": self.link,
            "url": self.link,
            "modified": self.modified_at.isoformat() if self.modified_at else None,
            "synced_at": self.synced_at.isoformat() if self.synced_at else None,
        }


class VideoPodcast(db.Model):
    __tablename__ = "video_podcasts"

    id = db.Column(db.Integer, primary_key=True)
    wp_post_id = db.Column(db.Integer, unique=True, nullable=True, index=True)
    source = db.Column(db.String(50), default="local", index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    transcript = db.Column(db.Text, nullable=True)
    video_url = db.Column(db.String(1000), nullable=False)
    thumbnail_url = db.Column(db.String(1000), nullable=True)
    tags = db.Column(db.Text, nullable=True)
    slug = db.Column(db.String(255), nullable=True)
    link = db.Column(db.String(1000), nullable=True)
    synced_at = db.Column(db.DateTime, nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    published_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    author = db.relationship("User", backref="video_podcasts")

    def tag_list(self):
        if not self.tags:
            return []
        try:
            value = json.loads(self.tags)
            return value if isinstance(value, list) else []
        except json.JSONDecodeError:
            return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

    def to_dict(self):
        return {
            "id": self.id,
            "wp_post_id": self.wp_post_id,
            "source": self.source,
            "title": self.title,
            "description": self.description,
            "transcript": self.transcript,
            "video_url": self.video_url,
            "thumbnail_url": self.thumbnail_url,
            "tags": self.tag_list(),
            "slug": self.slug,
            "link": self.link,
            "url": self.link or self.video_url,
            "author_id": self.author_id,
            "author": self.author.username if self.author else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "synced_at": self.synced_at.isoformat() if self.synced_at else None,
        }
    
class DeviceToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    platform = db.Column(db.String(50))  # e.g., 'ios', 'android'
    device_id = db.Column(db.String(255))  # Device fingerprint
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_used = db.Column(db.DateTime, default=datetime.utcnow)

class NotificationSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    posts_enabled = db.Column(db.Boolean, default=True)
    likes_enabled = db.Column(db.Boolean, default=True)
    comments_enabled = db.Column(db.Boolean, default=True)
    follows_enabled = db.Column(db.Boolean, default=True)
    events_enabled = db.Column(db.Boolean, default=True)
    blogs_enabled = db.Column(db.Boolean, default=True)


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # e.g., 'like', 'comment', 'blog'
    data = db.Column(db.Text)  # Store JSON as text
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, user_id, title, body, notification_type, data=None, **kwargs):
        self.user_id = user_id
        self.title = title
        self.body = body
        self.notification_type = notification_type
        # Convert dict → JSON automatically
        if isinstance(data, dict):
            self.data = json.dumps(data)
        elif isinstance(data, str):
            self.data = data
        elif data is None:
            self.data = None
        else:
            raise TypeError("Notification 'data' must be dict, str, or None")
        super().__init__(**kwargs)

    def get_data(self):
        """Return data as Python dict."""
        try:
            return json.loads(self.data) if self.data else {}
        except json.JSONDecodeError:
            return {}   


# ------------------------- Create Vector DB Model -------------------------
''' Vector database has been moved to its own service for scalability and performance.
class Document(db.Model):
    __tablename__ = "documents"

    id          = db.Column(db.Integer, primary_key=True)
    source      = db.Column(db.Text, nullable=False)
    chunk_index = db.Column(db.Integer, nullable=False)
    content     = db.Column(db.Text, nullable=False)
    embedding   = db.Column(Vector(1536), nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.now)
'''
    

##### ModerationLog model with explanations #####
class ModerationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True) # 🔹 Unique ID for each moderation event
    user_id = db.Column(db.Integer, nullable=True) # 🔹 ID of the user who submitted the content (can be null for anonymous or deleted users)
    content_type = db.Column(db.String(50))  # e.g., 'post', 'comment', 'message'
    content = db.Column(db.Text)   # 🔹 The actual text/content that was flagged
    score = db.Column(db.Float) # 🔹 The main moderation score (e.g., toxicity) used in the decision
    attributes = db.Column(db.JSON) # 🔹 Full set of moderation attributes (TOXICITY, INSULT, THREAT, etc.) returned from Perspective API
    severity = db.Column(db.String(20)) # 🔹 Severity level decided by the system (e.g., 'low', 'medium', 'high')
    auto_action = db.Column(db.String(20)) # 🔹 What action was automatically taken by the system (e.g., 'blocked', 'allowed', 'review')
    admin_override = db.Column(db.String(20), nullable=True) # 🔹 What the admin decided later (e.g., 'approved', 'rejected', 'escalated')
    admin_notes = db.Column(db.Text, nullable=True)  # 🔹 Optional notes from the admin explaining their override
    reviewed_by = db.Column(db.Integer, nullable=True) # 🔹 Admin user ID who reviewed and overrode the moderation decision
    reviewed_at = db.Column(db.DateTime) # 🔹 Timestamp when the admin reviewed it
    timestamp = db.Column(db.DateTime, default=datetime.utcnow) # 🔹 When the moderation log entry was created (automatically set)
    
def generate_uuid():
    return str(uuid.uuid4())

class Media(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    content = db.Column(db.LargeBinary, nullable=True)  # Nullable if using object storage
    content_type = db.Column(db.String(50), nullable=False)
    filename = db.Column(db.String(255))
    file_size = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    duration = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=True)
    s3_url = db.Column(db.String(500))  # Legacy field name storing object storage URL

class PostMedia(db.Model):
    __tablename__ = 'post_media'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id', ondelete='CASCADE'), nullable=False)
    media_id = db.Column(db.String(36), db.ForeignKey('media.id', ondelete='CASCADE'), nullable=False)
    order_index = db.Column(db.Integer, default=0)  # For ordering media in posts
    
    # Relationships
    post = db.relationship('Post', backref='post_media')
    media = db.relationship('Media', backref='post_attachments')
    
    __table_args__ = (db.UniqueConstraint('post_id', 'media_id', name='unique_post_media'),)

class BlogView(db.Model):
    __tablename__ = 'blog_view'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog_posts.id'), nullable=False)
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_duration = db.Column(db.Integer)  # seconds spent reading
    
    # Relationships
    user = db.relationship('User', backref='blog_views')
    blog = db.relationship('BlogPost', backref='views')
    
    __table_args__ = (db.UniqueConstraint('user_id', 'blog_id', name='unique_user_blog_view'),)
