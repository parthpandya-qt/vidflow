# VidFlow

VidFlow is a secure backend system built using Node.js, Express, and MongoDB that provides JWT-based authentication, user profile management, and Cloudinary-powered media handling.

This project demonstrates production-level backend architecture with secure session handling, refresh token rotation, and media lifecycle management.

---

## 🚀 Features

- User Registration & Login
- JWT Authentication (Access + Refresh Tokens)
- Secure Logout with Token Invalidation
- Password Hashing using bcrypt
- Profile Management (Update Name & Email)
- Avatar & Cover Image Upload
- Automatic Deletion of Old Images from Cloudinary
- Protected Routes using Middleware
- Watch History with MongoDB References

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt
- Multer
- Cloudinary

---

## 🔐 Security Highlights

- HTTP-only secure cookies
- Refresh token stored in database
- Password encryption with hashing middleware
- Sensitive fields excluded from responses
- Token verification and expiration handling

---

## 📂 Project Structure

