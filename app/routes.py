from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for,flash  # Add render/ # Add session here
from app.models import User, Post, Comment, Follow, Like, Chat, ProfessionalDetails, db
from flask_sqlalchemy import SQLAlchemy
import os
from app import bcrypt
from werkzeug.utils import secure_filename  # Import secure_filename
from app.utils import allowed_file
from flask import redirect


main = Blueprint('main', __name__)

@main.route('/')
def home():
    """Landing page or feed based on login status."""
    if 'user_id' in session:  # Check if user is logged in
        user_id = session['user_id']

        # Fetch posts from users the logged-in user follows
        following_ids = [f.followed_id for f in Follow.query.filter_by(follower_id=user_id).all()]
        print(f"Following IDs for user {user_id}: {following_ids}")
        
        if following_ids:  # If the user is following others
            posts = Post.query.filter(Post.user_id.in_(following_ids)).order_by(Post.timestamp.desc()).all()
            print(f"Posts fetched: {posts}")
        else:  # If the user isn't following anyone, show global posts
            posts = Post.query.order_by(Post.timestamp.desc()).all()

        # Render the feed for logged-in users
        return render_template('feed.html', posts=posts)
    else:
        # Render the landing page for guests
        return render_template('landing.html')



# --- Authentication Routes ---

@main.route('/login', methods=['GET', 'POST'])
def login():
    """Log in an existing user."""
    if request.method == 'GET':
        # Render the login page for GET requests
        return render_template('login.html')

    # Handle POST requests
    data = request.form  # Handle form-encoded data
    email = data.get('email')
    password = data.get('password')

    # Ensure email and password are provided
    if not email or not password:
        flash('Email and password are required', 'danger')
        return redirect(url_for('main.login'))

    # Authenticate user
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        # Save user ID in session
        session['user_id'] = user.id
        flash('Login successful', 'success')
        return redirect(url_for('main.home'))  # Redirect to the home page after login
    else:
        flash('Invalid email or password', 'danger')
        return redirect(url_for('main.login'))



@main.route('/logout', methods=['POST'])
def logout():
    """Log out the current user."""
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})


@main.route('/signup', methods=['GET', 'POST'])
def signup():
    """Sign up a new user."""
    if request.method == 'GET':
        # Determine user type from query parameters (e.g., ?type=professional or ?type=standard)
        user_type = request.args.get('type', 'standard')  # Default to standard user

        if user_type == 'professional':
            # Render the professional signup form
            return render_template('signup_professional.html')
        else:
            # Render the standard signup form
            return render_template('signup_standard.html')

    # Handle POST request for signup
    username = request.form['username']
    email = request.form['email']
    password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
    is_professional = request.form.get('is_professional', 'false') == 'true'

    # Additional fields for professionals
    license_number = request.form.get('license')  # Optional, only for professionals
    specialization = request.form.get('specialization')  # Optional, only for professionals

    # Check if the email is already registered
    if User.query.filter_by(email=email).first():
        flash('Email is already registered. Please log in.', 'danger')
        return redirect(url_for('main.signup'))

    # Create the user
    new_user = User(username=username, email=email, password=password, is_professional=is_professional)
    db.session.add(new_user)
    db.session.commit()

    # Save professional details if applicable
    if is_professional:
        professional_details = ProfessionalDetails(
            user_id=new_user.id,
            license=license_number,
            specialization=specialization
        )
        db.session.add(professional_details)
        db.session.commit()

    # Log the user in
    session['user_id'] = new_user.id

    # Redirect to the profile page after signup
    return redirect(url_for('main.profile', user_id=new_user.id))


#profile
@main.route('/update_profile/<int:user_id>', methods=['GET', 'POST'])
def update_profile(user_id):
    """Allow users to update their profile."""
    user = User.query.get_or_404(user_id)
    
    if request.method == 'POST':
        # Handle profile update
        user.username = request.form.get('username', user.username)
        user.bio = request.form.get('bio', user.bio)
        # Handle additional updates like profile picture, etc.
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('main.profile', user_id=user.id))
    
    return render_template('update_profile.html', user=user)


@main.route('/profile/<int:user_id>', methods=['GET'])
def profile(user_id):
    """Fetch user profile and posts."""
    user = User.query.get_or_404(user_id)
    posts = Post.query.filter_by(user_id=user_id).all()
    return render_template('profile.html', user=user, posts=posts)



@main.route('/upload_profile_pic', methods=['POST'])
def upload_profile_pic():
    """Handle profile picture upload."""
    if 'profile_pic' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    # Ensure the file type is allowed
    if not allowed_file(file.filename):
        return jsonify({'message': 'Invalid file type'}), 400

    # Save the file and update the user's profile picture
    filename = secure_filename(file.filename)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file.save(os.path.join(upload_folder, filename))

    user = User.query.get(session['user_id'])
    if user:
        user.profile_pic = filename
        db.session.commit()
        return jsonify({'message': 'Profile picture updated successfully', 'filename': filename}), 200
    else:
        return jsonify({'message': 'User not found'}), 404



@main.route('/add_friend/<int:user_id>', methods=['POST'])
def add_friend(user_id):
    current_user_id = session['user_id']
    if current_user_id == user_id:
        return jsonify({'message': 'You cannot add yourself as a friend'}), 400

    # Check if already friends
    existing_friendship = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    if existing_friendship:
        return jsonify({'message': 'Already friends'}), 400

    # Create friendship
    new_friendship = Follow(follower_id=current_user_id, followed_id=user_id)
    db.session.add(new_friendship)
    db.session.commit()
    return jsonify({'message': 'Friend added successfully'}), 200


# --- Feed and Post Routes ---

@main.route('/feed/<int:user_id>', methods=['GET'])
def feed(user_id):
    """Fetch posts from users the current user follows."""
    # Fetch IDs of users the logged-in user follows
    following = [follow.followed_id for follow in Follow.query.filter_by(follower_id=user_id).all()]

    # Include the user's own posts in the feed
    following.append(user_id)

    # Fetch posts, ordered by timestamp
    posts = Post.query.filter(Post.user_id.in_(following)).order_by(Post.timestamp.desc()).all()

    # Fetch post data
    feed_data = []
    for post in posts:
        # Determine if the current user liked the post
        liked_by_user = any(like.user_id == user_id for like in post.likes)

        # Fetch the latest 3 comments for the post
        latest_comments = post.comments[-3:]  # Adjust the number to fetch more or fewer comments
        comments_data = [
            {
                'author': comment.author.username,
                'author_pic': comment.author.profile_pic,
                'content': comment.content,
                'timestamp': comment.timestamp.isoformat()
            }
            for comment in latest_comments
        ]

        feed_data.append({
            'id': post.id,
            'author': post.author.username,
            'author_pic': post.author.profile_pic,
            'content': post.content,
            'image': post.image,
            'timestamp': post.timestamp.isoformat(),
            'likes': len(post.likes),
            'liked_by_user': liked_by_user,
            'comments': comments_data
        })

    # Return feed data as JSON
    return jsonify(feed_data)


@main.route('/post', methods=['POST'])
def create_post():
    data = request.json
    content = data.get('content')
    user_id = session['user_id']

    if not content:
        return jsonify({'message': 'Post content cannot be empty'}), 400

    post = Post(content=content, user_id=user_id)
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Post created successfully'}), 201



@main.route('/post/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Fetch a specific post."""
    post = Post.query.get_or_404(post_id)
    return jsonify({
        'id': post.id,
        'author': post.author.username,
        'author_pic': post.author.profile_pic,
        'content': post.content,
        'image': post.image,
        'timestamp': post.timestamp.isoformat(),
        'likes': len(post.likes),
        'comments': [{'id': comment.id, 'content': comment.content, 'author': comment.user_id} for comment in post.comments]
    })


# --- Like Routes ---

@main.route('/post/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    """Like or unlike a post."""
    user_id = session['user_id']
    existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()

    if existing_like:
        # Unlike the post
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({'message': 'Like removed'}), 200
    else:
        # Like the post
        new_like = Like(user_id=user_id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        return jsonify({'message': 'Post liked'}), 201


# --- Comment Routes ---

@main.route('/post/<int:post_id>/comment', methods=['POST'])
def add_comment(post_id):
    """Add a comment to a post."""
    user_id = session['user_id']
    data = request.json
    content = data.get('content')

    if not content:
        return jsonify({'message': 'Comment cannot be empty'}), 400

    comment = Comment(content=content, user_id=user_id, post_id=post_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({'message': 'Comment added successfully'}), 201


@main.route('/post/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    """Fetch all comments for a post."""
    comments = Comment.query.filter_by(post_id=post_id).all()
    return jsonify([
        {'id': comment.id, 'content': comment.content, 'author': comment.user_id, 'timestamp': comment.timestamp.isoformat()}
        for comment in comments
    ])


# --- Follow Routes ---

@main.route('/follow/<int:user_id>', methods=['POST'])
def follow(user_id):
    """Follow or unfollow a user."""
    current_user_id = session['user_id']
    follow_action = request.json.get('action', 'follow')  # Either 'follow' or 'unfollow'

    if follow_action == 'unfollow':
        existing_follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
        if existing_follow:
            db.session.delete(existing_follow)
            db.session.commit()
            return jsonify({'message': 'Unfollowed successfully'}), 200
        return jsonify({'message': 'You are not following this user'}), 400

    # Handle follow action
    existing_follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    if existing_follow:
        return jsonify({'message': 'Already following'}), 400

    new_follow = Follow(follower_id=current_user_id, followed_id=user_id)
    db.session.add(new_follow)
    db.session.commit()
    return jsonify({'message': 'Followed successfully'}), 201


@main.route('/followers/<int:user_id>', methods=['GET'])
def get_followers(user_id):
    """Fetch all followers of a user."""
    followers = Follow.query.filter_by(followed_id=user_id).all()
    return jsonify([
        {'id': follow.follower_id, 'username': follow.follower.username}
        for follow in followers
    ])


@main.route('/following/<int:user_id>', methods=['GET'])
def get_following(user_id):
    """Fetch all users the current user is following."""
    following = Follow.query.filter_by(follower_id=user_id).all()
    return jsonify([
        {'id': follow.followed_id, 'username': follow.followed.username}
        for follow in following
    ])

@main.route('/send_message', methods=['POST'])
def send_message():
    """Send a private message."""
    sender_id = session['user_id']
    data = request.json
    receiver_id = data.get('receiver_id')
    message = data.get('message')

    if not message or not receiver_id:
        return jsonify({'message': 'Message and receiver ID are required'}), 400

    if sender_id == receiver_id:
        return jsonify({'message': 'You cannot message yourself'}), 400

    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'message': 'Receiver not found'}), 404

    new_message = Chat(sender_id=sender_id, receiver_id=receiver_id, message=message)
    db.session.add(new_message)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully'}), 201


@main.route('/get_messages/<int:receiver_id>', methods=['GET'])
def get_messages(receiver_id):
    sender_id = session['user_id']
    messages = Chat.query.filter(
        ((Chat.sender_id == sender_id) & (Chat.receiver_id == receiver_id)) |
        ((Chat.sender_id == receiver_id) & (Chat.receiver_id == sender_id))
    ).order_by(Chat.timestamp.asc()).all()
    return jsonify([
        {'sender': msg.sender_id, 'receiver': msg.receiver_id, 'message': msg.message, 'timestamp': msg.timestamp}
        for msg in messages
    ])
