# AuthWay – TODO / Roadmap

This document tracks what is done and what remains for AuthWay as an authentication-as-a-service platform.

---

## ✅ Core API MVP (Mostly Done)

### App / Developer Side
- [x] Developer authentication (register / login)
- [x] App creation per developer
- [x] App activation / disable toggle
- [x] App edit (name, description, callback URL)
- [x] Soft delete apps (`deletedAt`)
- [x] Client ID generation per app
- [x] Client Secret generation (hashed in DB)
- [x] Client Secret rotation
- [x] Verify client middleware (Client ID + Secret)
- [x] Prevent inactive apps from accessing API

---

### End User Authentication API
- [x] EndUser schema (scoped per app)
- [x] Secure password hashing
- [x] Register end users via API
- [x] Login end users via API
- [x] JWT generation for end users
- [x] JWT verification middleware
- [x] Protected route example (`/api/me`)
- [x] Client-side logout (delete token)

---

## ⚠️ MVP+ (Strongly Recommended Next)

### Security & Stability
- [x] Rate limiting on auth endpoints (login/register)
- [x] Input validation (Joi / Zod)
- [x] Consistent API error format
- [x] Token expiration handling
- [x] Better logging (request + auth failures)

---

### End User Account Management
- [x] Forgot password API
- [x] Password reset with token
- [x] Email verification for end users
- [x] Optional server-side logout (token versioning)
- [ ] Account disable / soft delete

---

### App Management Improvements
- [x] Restrict callback URLs (allowlist)
- [x] Rotate Client ID (optional)
- [x] View app usage stats (logins, registrations)
- [x] Audit log per app

---

## 🚀 Production / SaaS Features

### Developer Experience
- [x] API documentation (OpenAPI / Swagger)
- [x] Postman collection
- [x] Example SDK usage (Node.js)
- [ ] Copy-paste integration snippets
- [ ] Dashboard usage metrics

---

### Platform & Scaling
- [ ] Refresh tokens
- [ ] Token revocation strategy
- [ ] Per-app rate limits
- [x] CORS configuration per app
- [ ] Environment separation (dev / prod keys)
- [ ] Monitoring & alerting

---

## 🧪 Testing
- [ ] Unit tests for auth logic
- [ ] Integration tests for API routes
- [ ] Security tests (invalid tokens, replay attacks)
- [ ] Load testing auth endpoints

---

## MVP Blockers
- [ ] Refresh tokens
- [ ] App-level domain allowlist
- [ ] Usage analytics UI

## 📦 Deployment
- [ ] Environment variable validation
- [ ] Production-ready MongoDB indexes
- [ ] Docker support
- [ ] CI pipeline
- [ ] Deployment checklist

---

## 📝 Notes
- JWTs are stateless and should NOT be stored in the database.
- Client secrets are shown **once only** on creation/rotation.
- End users are always scoped to an app.
- App credentials must always be validated before end-user actions.

---

**Current Status:**  
✅ Core API MVP complete  
🚧 Moving toward production hardening
