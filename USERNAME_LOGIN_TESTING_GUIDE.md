# Username Login Implementation - Testing Guide

## Overview
The API now supports **dual authentication methods**:
1. **Email + Password** (existing)
2. **Username + Password** (new)

Both methods have the same security features:
- Account lockout after 5 failed attempts
- Failed login attempt tracking
- Email verification check (when applicable)
- Active account validation

## Changes Made

### 1. Database Model (`models/endUser.js`)
- ✅ Added `username` field (optional, 3-30 chars, alphanumeric + underscores)
- ✅ Added unique index per app (sparse, allows multiple nulls)
- ✅ Username is case-insensitive (stored lowercase)

### 2. Registration (`controllers/api/auth.js`)
- ✅ Accepts optional `username` parameter
- ✅ Validates username format: `/^[a-zA-Z0-9_]{3,30}$/`
- ✅ Checks username uniqueness per app
- ✅ Returns username in response

### 3. Validation Schemas (`validators/api/endUserAuth.js`)
- ✅ Updated `registerSchema` to accept optional username
- ✅ Created `usernameLoginSchema` for username login validation

### 4. Routes (`routes/api/auth.js`)
- ✅ `/username-login` now uses `usernameLoginSchema`

### 5. Security (`controllers/api/auth.js`)
- ✅ Added account lockout check to `usernameLogin`
- ✅ Added failed attempt tracking to `usernameLogin`
- ✅ Added email verification check (when user has email)
- ✅ Added active account check
- ✅ Both login methods now have identical security

## API Endpoints

### Register with Username
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

### Login with Email
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

### Login with Username
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

### Test 1: Register with Username
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

### Test 2: Login with Username
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

### Test 3: Login with Email (should still work)
```bash
curl -X POST http://localhost:3000/api/auth/email-login \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
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
    "email": "test@example.com"
  }
}
```

### Test 4: Register without Username (backward compatibility)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouserer@example.com",
    "password": "Test1234!",
    "fullName": "No Username User"
  }'
```

This user can still login with email, but NOT with username.

### Test 5: Invalid Username Format
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "X-Client-Id: app_test123" \
  -H "Authorization: Bearer your_client_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "Test1234!",
    "fullName": "Test User 2",
    "username": "ab"  // Too short
  }'
```

Expected Error:
```json
{
  "message": "Username must be 3-30 characters, alphanumeric and underscores only"
}
```

### Test 6: Duplicate Username
Try to register another user with the same username - should get error:
```json
{
  "message": "Username is already taken"
}
```

### Test 7: Account Lockout (Username)
Try wrong password 5 times, then should get:
```json
{
  "message": "Too many failed login attempts. Try again later."
}
```

## Database Migration

If you have existing users, you need to create the new index:

```javascript
// Run this in your MongoDB shell or through your app
db.endusers.createIndex(
  { app: 1, username: 1 },
  { unique: true, sparse: true }
);
```

Or restart your app - Mongoose will create it automatically on startup.

## Security Considerations

1. **Username is optional** - Users can register without a username and still use email login
2. **Case-insensitive** - "TestUser" and "testuser" are the same
3. **Unique per app** - Same username can exist in different apps
4. **Format validation** - Only alphanumeric + underscores, 3-30 chars
5. **Same security** - Username login has identical security to email login

## Backward Compatibility

✅ **Fully backward compatible** - All existing functionality remains:
- Users without usernames can still login with email
- Existing email login endpoint unchanged
- No breaking changes to existing API

## Next Steps (Optional Enhancements)

1. **Add username update endpoint** - Allow users to change their username
2. **Add username validation endpoint** - Check if username is available
3. **Create unified login endpoint** - Accept either email OR username in one endpoint
4. **Add username to profile** - Display username in user profile

## Troubleshooting

### Issue: "Username field doesn't exist"
**Solution**: Make sure you've restarted the server after model changes, or manually create the index.

### Issue: "Cannot read property 'username' of undefined"
**Solution**: Check that the user actually has a username set. Not all users may have one.

### Issue: "Validation error on username"
**Solution**: Ensure username matches pattern `/^[a-zA-Z0-9_]{3,30}$/`

## Summary

✅ Both email and username authentication are now fully functional  
✅ Security is consistent across both methods  
✅ Backward compatible with existing users  
✅ Proper validation and error handling  
✅ Ready for production use  

The API can now authenticate users with **either email OR username**, giving you flexibility in how users access your application.