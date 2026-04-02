# Voult API Testing Guide

## Prerequisites
- **Client ID**: Your application's client ID (starts with `app_`)
- **Client Secret**: Your application's client secret
- **Base URL**: `https://voult.dev` (production) or your local development URL

---

## API Endpoints List

### Authentication
1. **Register** - `POST /api/auth/register`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
   - Body: `{ email, password, fullName }`

2. **Login** - `POST /api/auth/login`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
   - Body: `{ email, password }`

3. **Logout** - `POST /api/auth/logout`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `X-Client-Token: Bearer <token>`

### User Profile
4. **Get Profile** - `GET /api/user/me`
   - Headers: `X-Client-Token: Bearer <token>`

5. **Update Profile** - `PATCH /api/user/me`
   - Headers: `X-Client-Token: Bearer <token>`, `Content-Type: application/json`
   - Body: `{ fullName }`

### Password Management
6. **Forgot Password** - `POST /api/user/forgot-password`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
   - Body: `{ email }`

7. **Reset Password** - `POST /api/user/reset-password?token=<token>&appId=<appId>`
   - Headers: `X-Client-Id`, `X-Client-Secret`, `Content-Type: application/json`
   - Body: `{ password }`

### Account Management
8. **Disable Account** - `POST /api/user/disable`
   - Headers: `X-Client-Token: Bearer <token>`

9. **Re-enable Account** - `POST /api/user/reenable`
   - Headers: `X-Client-Token: Bearer <token>`

10. **Verify Email** - `GET /api/user/verify-email?token=<token>&appId=<appId>`
    - No headers required

### Session Management
11. **List Sessions** - `GET /api/sessions/`
    - Headers: `X-Client-Token: Bearer <token>`

12. **Revoke Session** - `GET /api/sessions/revoke/:sessionId`
    - Headers: `X-Client-Token: Bearer <token>`

13. **Refresh Token** - `GET /api/sessions/refresh`
    - Headers: `X-Client-Token: Bearer <token>`

### OAuth Account Linking
14. **Get Linked Providers** - `GET /api/me/oauth`
    - Headers: `X-Client-Token: Bearer <token>`

15. **Link Provider** - `POST /api/oauth/:provider/link`
    - Headers: `X-Client-Token: Bearer <token>`

16. **Unlink Provider** - `DELETE /api/me/oauth/:provider`
    - Headers: `X-Client-Token: Bearer <token>`

17. **Set Password** - `POST /api/me/set-password`
    - Headers: `X-Client-Token: Bearer <token>`, `Content-Type: application/json`
    - Body: `{ password }`

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

---

## Important Notes
1. Use `X-Client-Token` header (not `Authorization`) for end-user authentication
2. Include `Bearer ` prefix before the token value
3. `X-Client-Id` AND `X-Client-Secret` are required for registration, login, logout, and password operations
4. Access tokens expire - use refresh endpoint to get new tokens
