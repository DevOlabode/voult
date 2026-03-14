# Deployment readiness — Auth service

**Short answer:** Yes. From a **service/backend** perspective, the auth service is ready to deploy. Frontend polish and docs are separate; the API, security, and config are in good shape for production.

---

## What’s production-ready

| Area | Status |
|------|--------|
| **Core auth** | Register, login, logout, email verification, password reset, JWT + refresh tokens |
| **Security** | bcrypt (rounds 12), account lockout, rate limiting (API + auth), token revocation |
| **API** | Consistent `ApiError` and error handler, Joi validation, client ID/secret + callback allowlist |
| **Config** | `ENDUSER_JWT_SECRET` and `BASE_URL` validated at startup; DB fails fast on connect error |
| **Infra** | `trust-proxy: 1` for behind reverse proxy; CORS configured |

---

## Before you deploy — checklist

1. **Required env (see `.env.example`)**
   - `ENDUSER_JWT_SECRET` — long, random secret for end-user JWTs (required at startup).
   - `BASE_URL` — public base URL (e.g. `https://api.voult.dev`) for verification/reset links.
   - `DB_URL` — MongoDB connection string (app exits if connect fails).
   - `PORT` — server port (defaults to `3000` if unset).
   - `SECRET` — session secret for web (developer) sessions; validate in production.

2. **Session (web app)**
   - Session cookie is set to `secure: true` when `NODE_ENV=production` (HTTPS only).
   - Ensure `SECRET` is set and strong in production.

3. **Email**
   - Set `BREVO_USER` and `BREVO_SMTP_KEY` for verification, reset, and lockout emails.
   - In production, consider setting `tls.rejectUnauthorized: true` in `config/mailer.js` (or remove override) so SMTP TLS is verified.

4. **CORS**
   - Origins are in `src/index.js`. For production, add your real frontend/API origins; avoid trailing slashes.

5. **Optional**
   - `NODE_ENV=production` — enables secure cookies and production behavior.
   - `SEND_EMAILS=true` — in dev, set this to actually send email; in production, emails are sent when not in dev.

---

## Not required for “service ready to deploy”

- **Frontend / styling** — Landing, dashboard, and settings can be improved later; API behavior is independent.
- **Docs** — Swagger at `/docs`, Postman collection, and README exist; extra docs are nice-to-have.
- **.env.example** — Added in this repo for deployers; copy to `.env` and fill in.

---

## Quick start (production-like)

```bash
cp .env.example .env
# Edit .env: ENDUSER_JWT_SECRET, BASE_URL, DB_URL, SECRET, BREVO_*
npm install
NODE_ENV=production npm start
```

---

## Summary

The auth **service** (API, security, tokens, DB, env checks) is ready to deploy. Set the required env vars, fix session/email/CORS for your environment, then add frontend and documentation as you go.
