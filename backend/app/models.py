from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from app import db  # ✅ Import the same db instance


#db = SQLAlchemy()

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
    profile_pic     = db.Column(db.String(200), default="default.jpg")
    user_type       = db.Column(db.String(20), default="standard")  # ✅ Defaulgt to "standard" or "professional"


    # ✅ Relationships
    posts       = db.relationship("Post", backref="author", lazy=True, cascade="all, delete-orphan")
    followers   = db.relationship("Follow", foreign_keys="[Follow.followed_id]", backref="followed", lazy=True)
    following   = db.relationship("Follow", foreign_keys="[Follow.follower_id]", backref="follower", lazy=True)

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
    image = db.Column(db.String(200), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Added timestamp
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)

    status = db.Column(db.String(20), default="visible")  # visible, removed, flagged
    
    # ✅ Relationships
    comments = db.relationship("Comment", backref="post", lazy=True, cascade="all, delete-orphan")
    likes = db.relationship("Like", backref="post", lazy=True, cascade="all, delete-orphan")


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

    # ✅ Unique Constraint (Prevent duplicate follows)
    __table_args__ = (db.UniqueConstraint("follower_id", "followed_id", name="unique_follow"),)

# -------------------------
# 🚀 Chat Model
# -------------------------
class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # ✅ Prevent users from messaging themselves
    __table_args__ = (db.CheckConstraint("sender_id != receiver_id", name="check_no_self_message"),)

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
     
    user = db.relationship("User", backref="reactions")
    post = db.relationship("Post", backref="reactions")

# ------------------------- Create BlogPost Model -------------------------
class BlogPost(db.Model):
    __tablename__ = "blog_posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(500))  # Optional image
    
class DeviceToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    platform = db.Column(db.String(50))  # e.g., 'ios', 'android'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    

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
    