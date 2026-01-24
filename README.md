# 🔐 Voult — Authentication as a Service for Developers

Voult is a **developer-first authentication platform** that provides secure, scalable, and easy-to-integrate authentication APIs for modern web applications.

It handles the hard parts of auth — user management, email verification, password resets, JWT handling, and account security — so developers can focus on building products, not auth systems.

🌐 Live: https://www.voult.dev  
📦 Repo: https://github.com/DevOlabode/voult

---

## ✨ Features

### Core Authentication
- User registration (email + password)
- Secure login & logout
- JWT-based authentication
- Email verification flow
- Password reset (forgot & reset)
- Password strength enforcement
- Prevent login for:
  - Unverified emails
  - Disabled accounts

### Account Management
- Soft delete (disable account)
- Re-enable disabled accounts
- Token revocation via `tokenVersion`
- Current user endpoint (`/me`)

### Developer-Focused
- API-first architecture
- Clean MVC structure
- Built for extensibility
- SDK support (WIP)
- Rate-limited sensitive endpoints

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express
- **Auth**: JWT, Passport.js
- **Database**: MongoDB + Mongoose
- **Templating**: EJS (for emails & views)
- **Security**: bcrypt, rate limiting, validation middleware
- **Frontend (Landing / Docs)**: HTML, CSS, JS

---

## 📂 Project Structure

```bash
voult/
├── config/          # App & auth configuration
├── controllers/     # Request handlers (auth, users, etc.)
├── models/          # Mongoose schemas
├── routes/          # API routes
├── services/        # Business logic (tokens, email, etc.)
├── validators/      # Input validation logic
├── utils/           # Shared utilities
├── views/           # EJS templates
├── public/          # Static assets
├── sdk/             # Client SDK (WIP)
├── TODO.md          # Product roadmap
└── structure.md     # Architecture notes
