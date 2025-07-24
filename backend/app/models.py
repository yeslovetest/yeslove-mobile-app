from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.orm import declarative_base
from app.extensions import db

Base = declarative_base()


#db = SQLAlchemy()

# -------------------------
# 🚀 User Model (Keycloak Integrated)
# -------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    keycloak_id = db.Column(db.String(255), unique=True, nullable=False, index=True)  # ✅ Store Keycloak's `sub`
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    birthday = db.Column(db.Date, nullable=True)  # Store as date
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Track user creation time
    bio = db.Column(db.String(250), default="")
    profile_pic = db.Column(db.String(200), default="default.jpg")
    user_type = db.Column(db.String(20), default="standard")  # ✅ Defaulgt to "standard" or "professional"

    # ✅ Relationships
    posts = db.relationship("Post", backref="author", lazy=True, cascade="all, delete-orphan")
    followers = db.relationship("Follow", foreign_keys="[Follow.followed_id]", backref="followed", lazy=True)
    following = db.relationship("Follow", foreign_keys="[Follow.follower_id]", backref="follower", lazy=True)

    # ✅ One-to-One Relationship with ProfessionalDetails
    professional_details = db.relationship(
        "ProfessionalDetails", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    
    # Warning and suspension to user
    warnings = db.Column(db.Integer, default=0)
    is_suspended = db.Column(db.Boolean, default=False)


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
# 🚀 Professional Details Model (One-to-One Relationship with User..)
# -------------------------
class ProfessionalDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False)
    license = db.Column(db.String(100), nullable=True)
    specialization = db.Column(db.String(200), nullable=True)

    # ✅ Relationship to User
    user = db.relationship(
        "User",
        back_populates="professional_details",
        single_parent=True  # ✅ Ensure only one `ProfessionalDetails` per `User`
    )


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


##### ModerationLog model with explanations #####
class ModerationLog(db.Model):
    # 🔹 Unique ID for each moderation event
    id = db.Column(db.Integer, primary_key=True)

    # 🔹 ID of the user who submitted the content (can be null for anonymous or deleted users)
    user_id = db.Column(db.Integer, nullable=True)

    # 🔹 What kind of content this is (e.g., 'post', 'comment', 'message')
    content_type = db.Column(db.String(50))  # e.g., 'post', 'comment', 'message'

    # 🔹 The actual text/content that was flagged
    content = db.Column(db.Text)

    # 🔹 The main moderation score (e.g., toxicity) used in the decision
    score = db.Column(db.Float)

    # 🔹 Full set of moderation attributes (TOXICITY, INSULT, THREAT, etc.) returned from Perspective API
    attributes = db.Column(db.JSON)

    # 🔹 Severity level decided by the system (e.g., 'low', 'medium', 'high')
    severity = db.Column(db.String(20))  # low, medium, high

    # 🔹 What action was automatically taken by the system (e.g., 'blocked', 'allowed', 'review')
    auto_action = db.Column(db.String(20))  # blocked, allowed, review

    # 🔹 What the admin decided later (e.g., 'approved', 'rejected', 'escalated')
    admin_override = db.Column(db.String(20), nullable=True)

    # 🔹 Optional notes from the admin explaining their override
    admin_notes = db.Column(db.Text, nullable=True)

    # 🔹 Admin user ID who reviewed and overrode the moderation decision
    reviewed_by = db.Column(db.Integer, nullable=True)

    # 🔹 Timestamp when the admin reviewed it
    reviewed_at = db.Column(db.DateTime)

    # 🔹 When the moderation log entry was created (automatically set)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
