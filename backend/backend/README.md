# YesLove Mobile App Backend - Local Setup Guide

## 📌 Prerequisites
Ensure you have the following installed before proceeding:
- Python 3.12+
- Flask
- SQLite3
- Virtualenv
- Postman (for testing API endpoints)
- Keycloak (for authentication)

## 🔧 Step 1: Clone the Repository
```bash
git clone https://github.com/yeslovetest/yeslove-mobile-app.git
cd yeslove-mobile-app/backend
```

## 🏗 Step 2: Set Up a Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # For macOS/Linux
# OR
.venv\Scripts\activate  # For Windows
```

## 📦 Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

## 🛠 Step 4: Configure Environment Variables
Create a `.env` file inside `backend` and add the following:
```ini
FLASK_APP=app
FLASK_ENV=development
SQLALCHEMY_DATABASE_URI=sqlite:///instance/development.db
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM_NAME=YesLove_Auth
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

## 🛠 Step 5: Setup KeyCloak
# KeyCloak has been installed into the KeyCloakService directory

Install Docker 
In the (docker-compose.yaml) 
Run the Keycloak Service 
Open http://localhost:8080/

## 📂 Step 6: Initialize the Database
```bash
flask db init  # Run only if migrations folder is missing
flask db migrate -m "Initial migration"
flask db upgrade
```

## 🚀 Step 7: Start the Flask Application
```bash
flask run
```
This will start the backend at `http://127.0.0.1:5000`

---

# 🔍 Testing API Endpoints
You can test the API endpoints using **Postman**, **cURL**, or **Swagger UI**.

## 📌 Step 1: Swagger UI
Open a browser and go to:
```bash
http://127.0.0.1:5000/swagger
```
Here, you can explore and test all API endpoints with documentation.

## 📌 Step 2: Sample API Requests

### 1️⃣ **User Login**
```bash
POST http://127.0.0.1:5000/api/login
Headers: { "Content-Type": "application/json" }
Body: {
  "username": "testuser",
  "password": "password123"
}
```

### 2️⃣ **Fetch User Profile** (Requires Authentication)
```bash
GET http://127.0.0.1:5000/api/profile/{keycloak_id}
Headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

### 3️⃣ **Create a New Post**
```bash
POST http://127.0.0.1:5000/api/post
Headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "content": "Hello, this is my first post!"
}
```

### 4️⃣ **React to a Post**
```bash
POST http://127.0.0.1:5000/api/post/{post_id}/reaction
Headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "reaction_type": "like"
}
```

### 5️⃣ **Follow a User**
```bash
POST http://127.0.0.1:5000/api/follow/{user_id}
Headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "action": "follow"
}
```

---

# ✅ Common Issues & Fixes

### **1. Flask App Not Starting?**
- Ensure you activated the virtual environment:
  ```bash
  source .venv/bin/activate
  ```
- Ensure all dependencies are installed:
  ```bash
  pip install -r requirements.txt
  ```

### **2. Database Issues?**
- If migrations aren't applied, try:
  ```bash
  flask db upgrade
  ```
- If database is missing tables, recreate it:
  ```bash
  rm -rf backend/instance/development.db
  flask db upgrade
  ```

### **3. Keycloak Authentication Issues?**
- Ensure Keycloak is running and configured properly:
  ```bash
  docker ps  # Check if Keycloak container is running
  ```
- Verify `KEYCLOAK_SERVER_URL` is correct in `.env`

---

# 📌 Next Steps
- Implement additional security features
- Improve API error handling
- Deploy the app to a cloud platform

---

💡 **Need Help?**
If you encounter issues, feel free to open an issue on the repository or reach out to the team!

