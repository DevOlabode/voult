# Username Authentication - API Testing Guide

## Overview
The API now supports **username-based authentication** for both registration and login:
1. **Register with email** (`/api/auth/register`) - Existing (accepts optional username)
2. **Register with username** (`/api/auth/username-register`) - **NEW**
3. **Login with email** (`/api/auth/email-login`) - Existing
4. **Login with username** (`/api/auth/username-login`) - Fixed and secured

All authentication methods have the same security features:
- Account lockout after 5 failed attempts
- Failed login attempt tracking
- Email verification check (when applicable)
- Active account validation

## API Endpoints

### 1. Register with Email (optional username)
```http
POST /api/auth/register
Headers:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "username": "johndoe"  // Optional
}
```

### 2. Register with Username (email optional) - NEW
```http
POST /api/auth/username-register
Headers:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
  Content-Type: application/json

Body:
{
  "username": "johndoe",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "email": "user@example.com"  // Optional
}
```

### 3. Login with Email
```http
POST /api/auth/email-login
Headers:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### 4. Login with Username
```http
POST /api/auth/username-login
Headers:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
  Content-Type: application/json

Body:
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

## Testing Scenarios

### Test 1: Register with Username (NEW)
```bash
curl -X POST http://localhost:3000/api/auth/username-register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234!",
    "fullName": "Test User",
    "email": "test@example.com"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Test 2: Register with Username (email optional)
```bash
curl -X POST http://localhost:3000/api/auth/username-register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "password": "Test1234!",
    "fullName": "Test User 2"
  }'
```

This user can login with username but has no email for verification.

### Test 3: Login with Username
```bash
curl -X POST http://localhost:3000/api/auth/username-login \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234!"
  }'
```

Expected Response:
```json
{
  "message": "Login successful",
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Test 4: Register with Email (with optional username)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "fullName": "Test User",
    "username": "testuser"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "username": "testuser"
  }
}
```

### Test 5: Invalid Username Format
```bash
curl -X POST http://localhost:3000/api/auth/username-register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "password": "Test1234!",
    "fullName": "Test User"
  }'
```

Expected Error (400):
```json
{
  "message": "Username must be 3-30 characters, alphanumeric and underscores only"
}
```

### Test 6: Duplicate Username
```bash
curl -X POST http://localhost:3000/api/auth/username-register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234!",
    "fullName": "Another User"
  }'
```

Expected Error (409):
```json
{
  "message": "Username is already taken"
}
```

### Test 7: Account Lockout (Username Login)
Try wrong password 5 times, then should get:
```json
{
  "message": "Too many failed login attempts. Try again later."
}
```

## Username Validation Rules

- **Length**: 3-30 characters
- **Characters**: Letters (a-z, A-Z), numbers (0-9), underscores (_) only
- **Case**: Case-insensitive (stored lowercase)
- **Uniqueness**: Must be unique per app
- **Required for**: `/username-register` endpoint
- **Optional for**: `/register` endpoint

### Valid Examples
- `johndoe`
- `john_doe`
- `john123`
- `john_doe_123`

### Invalid Examples
- `jo` (too short)
- `john-doe` (contains hyphen)
- `john.doe` (contains period)
- `john doe` (contains space)
- `verylongusername1234567890` (too long)

## Key Differences Between Endpoints

### `/register` (Email-based)
- **Email**: Required
- **Username**: Optional
- **Use case**: Traditional email registration with optional username

### `/username-register` (Username-based) - NEW
- **Username**: Required
- **Email**: Optional
- **Use case**: Username-first registration (email not required)

### `/email-login`
- **Email**: Required
- **Password**: Required
- **Use case**: Login with email

### `/username-login`
- **Username**: Required
- **Password**: Required
- **Use case**: Login with username

## Security Features

Both registration and login methods include:
- ✅ Account lockout after 5 failed login attempts
- ✅ Failed login attempt tracking
- ✅ Email verification check (when email is provided)
- ✅ Active account validation
- ✅ Password strength validation
- ✅ Username format validation
- ✅ Uniqueness checking (per app)

## Database Considerations

### Indexes
The EndUser model has these indexes:
```javascript
// Email uniqueness per app
{ app: 1, email: 1 } - unique, sparse

// Username uniqueness per app
{ app: 1, username: 1 } - unique, sparse
```

### Existing Users
If you have existing users, Mongoose will automatically create the username index on startup. No manual migration needed.

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation error (invalid format, missing required fields) |
| 401 | Invalid credentials (wrong password) |
| 403 | Email not verified or account disabled |
| 409 | Conflict (email or username already exists) |
| 423 | Account locked (too many failed attempts) |

## Backward Compatibility

✅ **Fully backward compatible**:
- Existing `/register` endpoint still works (email required, username optional)
- Existing `/email-login` endpoint unchanged
- Users without usernames can still login with email
- No breaking changes to existing API

## Summary

✅ **Username registration is now fully functional**  
✅ **Username login is secured with all security features**  
✅ **Email registration still works with optional username**  
✅ **Consistent validation across all endpoints**  
✅ **Backward compatible with existing users**  
✅ **Ready for production use**

The API now provides flexible authentication options: users can register and login with either email or username, giving your application maximum flexibility.