# Voult API Testing Guide

## Prerequisites
- **Client ID**: Your application's client ID (starts with `app_`)
- **Client Secret**: Your application's client secret (keep this secure!)
- **Base URL**: `https://voult.dev` (production) or your local development URL

---

## API Endpoints List

### Authentication (Email/Password)
These endpoints require both `X-Client-Id` and `X-Client-Secret` for app verification.

1. **Register** - `POST /api/auth/register`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
   - Body: `{ email, password, fullName }`

2. **Login** - `POST /api/auth/login`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
   - Body: `{ email, password }`

3. **Logout** - `POST /api/auth/logout`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `X-Client-Token: Bearer <token>`

### OAuth Authentication
These endpoints only require `X-Client-Id` (no secret) as they handle OAuth callback flows.

4. **Google Register** - `POST /api/auth/google/register`
   - Headers: `X-Client-Id`, `Content-Type: application/json`
   - Body: `{ idToken, fullName, email }`

5. **Google Login** - `POST /api/auth/google/login`
   - Headers: `X-Client-Id`, `Content-Type: application/json`
   - Body: `{ idToken }`

6. **GitHub Register** - `POST /api/auth/github/register`
   - Headers: `X-Client-Id`, `Content-Type: application/json`
   - Body: `{ code }`

7. **GitHub Login** - `POST /api/auth/github/login`
   - Headers: `X-Client-Id`, `Content-Type: application/json`
   - Body: `{ code }`

8. **Facebook Register** - `POST /api/auth/facebook/register`
   - Headers: `X-Client-Id`, `Content-Type: application/json`
   - Body: `{ accessToken }`

9. **Facebook Login** - `POST /api/auth/facebook/login`
   - Headers: `X-Client-Id`, `Content-Type: application/json`
   - Body: `{ accessToken }`

10. **LinkedIn Register** - `POST /api/auth/linkedin/register`
    - Headers: `X-Client-Id`, `Content-Type: application/json`
    - Body: `{ code }`

11. **LinkedIn Login** - `POST /api/auth/linkedin/login`
    - Headers: `X-Client-Id`, `Content-Type: application/json`
    - Body: `{ code }`

12. **Microsoft Register** - `POST /api/auth/microsoft/register`
    - Headers: `X-Client-Id`, `Content-Type: application/json`
    - Body: `{ code }`

13. **Microsoft Login** - `POST /api/auth/microsoft/login`
    - Headers: `X-Client-Id`, `Content-Type: application/json`
    - Body: `{ code }`

### User Profile
These endpoints require user authentication via `X-Client-Token`.

14. **Get Profile** - `GET /api/user/me`
    - Headers: `X-Client-Token: Bearer <token>`

15. **Update Profile** - `PATCH /api/user/me`
    - Headers: `X-Client-Token: Bearer <token>`, `Content-Type: application/json`
    - Body: `{ fullName }`

### Password Management
These endpoints require both `X-Client-Id` and `X-Client-Secret` for app verification.

16. **Forgot Password** - `POST /api/user/forgot-password`
    - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
    - Body: `{ email }`

17. **Reset Password** - `POST /api/user/reset-password?token=<token>&appId=<appId>`
    - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
    - Body: `{ password }`

### Account Management
These endpoints require user authentication via `X-Client-Token`.

18. **Disable Account** - `POST /api/user/disable`
    - Headers: `X-Client-Token: Bearer <token>`

19. **Re-enable Account** - `POST /api/user/reenable`
    - Headers: `X-Client-Token: Bearer <token>`

20. **Verify Email** - `GET /api/user/verify-email?token=<token>&appId=<appId>`
    - No headers required (public endpoint)

### Session Management
These endpoints require user authentication via `X-Client-Token`.

21. **List Sessions** - `GET /api/sessions/`
    - Headers: `X-Client-Token: Bearer <token>`

22. **Revoke Session** - `GET /api/sessions/revoke/:sessionId`
    - Headers: `X-Client-Token: Bearer <token>`

23. **Refresh Token** - `GET /api/sessions/refresh`
    - Headers: `X-Client-Token: Bearer <token>`

### OAuth Account Linking
These endpoints require user authentication via `X-Client-Token`.

24. **Get Linked Providers** - `GET /api/me/oauth`
    - Headers: `X-Client-Token: Bearer <token>`

25. **Link Provider** - `POST /api/oauth/:provider/link`
    - Headers: `X-Client-Token: Bearer <token>`

26. **Unlink Provider** - `DELETE /api/me/oauth/:provider`
    - Headers: `X-Client-Token: Bearer <token>`

27. **Set Password** - `POST /api/me/set-password`
    - Headers: `X-Client-Token: Bearer <token>`, `Content-Type: application/json`
    - Body: `{ password }`

---

## Authentication Header Summary

| Endpoint Type | Required Headers |
|--------------|------------------|
| Email/Password Auth (register, login, logout) | `X-Client-Id` + `X-Client-Secret` |
| OAuth Auth (Google, GitHub, etc.) | `X-Client-Id` only |
| Password Management (forgot, reset) | `X-Client-Id` + `X-Client-Secret` |
| User Profile & Account | `X-Client-Token: Bearer <token>` |
| Session Management | `X-Client-Token: Bearer <token>` |
| OAuth Linking | `X-Client-Token: Bearer <token>` |
| Email Verification | No headers (public) |

---

## Common Error Codes
- `UNAUTHORIZED` (401): Authentication required or invalid token
- `FORBIDDEN` (403): Account disabled or insufficient permissions
- `VALIDATION_ERROR` (400): Invalid input data
- `USER_EXISTS` (409): User already registered
- `INVALID_CREDENTIALS` (401): Wrong email or password
- `ACCOUNT_LOCKED` (423): Too many failed login attempts
- `EMAIL_NOT_VERIFIED` (403): Email verification required
- `TOKEN_EXPIRED` (401): Access token has expired
- `TOKEN_REVOKED` (401): Token has been revoked
- `CLIENT_ID_REQUIRED` (401): Missing X-Client-Id header
- `CLIENT_SECRET_REQUIRED` (401): Missing X-Client-Secret header
- `INVALID_CLIENT` (401): Invalid or inactive app
- `INVALID_CLIENT_SECRET` (401): Invalid client secret

---

## Important Notes
1. **X-Client-Token**: Use this header (not `Authorization`) for end-user authentication
2. **Bearer Prefix**: Always include `Bearer ` before the token value
3. **Client Secret**: Required for email/password auth and password management endpoints
4. **Token Expiration**: Access tokens expire - use the refresh endpoint to get new tokens
5. **Security**: Never expose your client secret in client-side code