# 🌊 Ripple

A simple social media REST API built with Node.js, Express, and MongoDB. Ripple allows users to create accounts, make posts, and interact with content — with role-based access control for admins and moderators.

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Image Uploads:** Cloudinary
- **Cookie Parsing:** cookie-parser

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB database (local or Atlas)
- Cloudinary account

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ay-dannex/ripple.git
   cd ripple
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_TOKEN=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

---

## 👤 User Roles

| Role | Permissions |
|------|-------------|
| `user` | Create, update, and delete their own posts |
| `moderator` | All user permissions + delete regular user posts |
| `admin` | Full access — can delete any post |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/register` | Register a new user | No |
| POST | `/api/user/login` | Login and receive token | No |
| POST | `/api/user/logout` | Logout user | Yes |

### Posts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/post/create` | Create a new post | Yes |
| GET | `/api/post` | Get all posts by logged in user | Yes |
| PATCH | `/api/post/:id` | Update a post | Yes |
| DELETE | `/api/post/:id` | Delete a post | Yes |

---

## 🔐 Authentication

Ripple uses **JWT authentication** via HTTP-only cookies. After logging in, the token is automatically attached to subsequent requests.

To test with Postman:
1. Hit the `/api/user/login` endpoint with your credentials
2. Copy the token from the response
3. Add it as a **Bearer Token** in the Authorization tab of your requests

---

## 📁 Project Structure

```
src/
├── config/
│   ├── cloudinary.js
│   └── database.js
├── controllers/
│   ├── post.controller.js
│   └── user.controller.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── post.model.js
│   └── user.model.js
├── routes/
│   ├── post.route.js
│   └── users.route.js
├── app.js
└── index.js
```

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
