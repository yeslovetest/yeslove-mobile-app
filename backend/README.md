<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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
PERSPECTIVE_API_KEY=your-key-here
```

## 📂 Step 5: Initialize the Database

```bash
flask db init  # Run only if migrations folder is missing
flask db migrate -m "Initial migration"
flask db upgrade
```

## 🚀 Step 6: Start the Flask Application

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
>>>>>>> 49eca51 (Implemented user restriction on posts, comments, and chat using moderation)
