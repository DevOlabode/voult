# Testing Per-App OAuth Provider Enable/Disable Feature

This guide provides step-by-step instructions to test the new per-app OAuth provider functionality.

## 🚀 New Feature: Enhanced OAuth Provider Metadata

This implementation adds comprehensive provider metadata storage and management to your OAuth system. Here's what's new:

### **Key Improvements**

1. **Rich Provider Profiles**: Each linked OAuth account now stores:
   - Provider user ID (stable identity)
   - Email (provider-verified)
   - Display name
   - Profile avatar
   - Raw provider response (for debugging)

2. **App Isolation**: Each app maintains independent OAuth accounts
3. **Professional UX**: Users see avatars and proper names in account dashboards
4. **Identity Security**: Identity is `(provider + providerUserId + app)` - never just email

### **New Data Structure**
```javascript
{
  user: ObjectId,           // User who owns this account
  app: ObjectId,            // App this account is linked to
  provider: "google",       // Provider name
  providerUserId: "12345",  // Stable provider user ID
  profile: {
    email: "user@example.com",
    name: "John Doe", 
    avatar: "https://...",
    raw: { /* full provider response */ }
  },
  accessToken: "...",
  refreshToken: "...",
  tokenExpiresAt: Date
}
```

## Prerequisites

1. Application running locally (e.g., `npm start` or `node src/index.js`)
2. Access to developer dashboard (typically at `/dashboard`)
3. At least one app created in the system
4. OAuth provider credentials configured for testing (Google, GitHub, etc.)

## Test Scenarios

### 1. Provider Visibility Endpoint

**Purpose**: Test the new endpoint that shows which providers are enabled for an app.

**Steps**:
1. Create or identify an app ID from your dashboard
2. Make a GET request to the provider visibility endpoint:

```bash
curl -X GET "http://localhost:3000/api/{appId}"
```

**Expected Response**:
```json
{
  "providers": {
    "google": true,
    "github": false,
    "facebook": true,
    "linkedin": false,
    "apple": false,
    "microsoft": true
  }
}
```

**Test Cases**:
- ✅ Test with valid app ID
- ✅ Test with non-existent app ID (should return 404)
- ✅ Test with inactive app (should return 404)

### 2. OAuth Callback with Disabled Provider

**Purpose**: Verify that OAuth callbacks are blocked when a provider is disabled.

**Steps**:
1. In your app settings, disable a provider (e.g., Google OAuth)
2. Try to initiate OAuth flow for that provider
3. Check the callback response

**Expected Behavior**:
- Should receive `403 Forbidden` with error: `"PROVIDER_DISABLED_FOR_THIS_APP"`
- OAuth flow should be blocked before any token exchange

### 3. OAuth Callback with Enabled Provider

**Purpose**: Verify that OAuth callbacks work normally when a provider is enabled.

**Steps**:
1. Enable a provider in your app settings
2. Complete the full OAuth flow:
   - Initiate OAuth (redirect to provider)
   - Authenticate with provider
   - Return to callback URL
3. Verify successful authentication

**Expected Behavior**:
- Should complete successfully
- Should receive proper authentication token or redirect

### 4. Token Exchange with App Credentials

**Purpose**: Verify that token exchange uses app-specific credentials instead of environment variables.

**Steps**:
1. Configure different OAuth credentials for two different apps
2. Test OAuth flow for both apps
3. Monitor network requests or logs to verify correct credentials are used

**Expected Behavior**:
- Each app should use its own configured credentials
- No fallback to environment variables

### 5. Provider Configuration Validation

**Purpose**: Test the validation that prevents disabling providers with linked users.

**Steps**:
1. Enable Google OAuth for an app
2. Have a user link their Google account to that app
3. Try to disable Google OAuth in app settings
4. Attempt to save the changes

**Expected Behavior**:
- Should receive error: `"Cannot disable Google OAuth while users have linked accounts. Unlink accounts first."`
- Provider should remain enabled

### 6. Multiple Provider Testing

**Purpose**: Test that different apps can have different provider configurations.

**Steps**:
1. Create two apps
2. Enable Google OAuth for App A, disable for App B
3. Enable GitHub OAuth for App B, disable for App A
4. Test OAuth flows for both apps

**Expected Behavior**:
- App A should allow Google OAuth but block GitHub
- App B should allow GitHub OAuth but block Google
- Each app maintains independent provider settings

## 🆕 NEW: Provider Metadata Testing

### 7. OAuth Account Metadata Storage

**Purpose**: Verify that OAuth accounts store rich profile metadata.

**Steps**:
1. Link a Google account to your app
2. Check the OAuthAccount document in your database
3. Verify the profile object contains:
   - `email`: Provider-verified email
   - `name`: Display name
   - `avatar`: Profile image URL
   - `raw`: Full provider response

**Expected Behavior**:
- OAuthAccount should have complete profile object
- Metadata should be provider-specific (Google vs GitHub vs Facebook)

### 8. User OAuth Management Endpoint

**Purpose**: Test the new endpoint that retrieves all linked providers with metadata.

**Steps**:
1. Link multiple providers (Google, GitHub, Facebook) to your account
2. Make a GET request to the user OAuth endpoint:

```bash
curl -X GET "http://localhost:3000/api/me/oauth" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "providers": [
    {
      "provider": "google",
      "avatar": "https://lh3.googleusercontent.com/...",
      "name": "John Doe",
      "email": "john@example.com",
      "linkedAt": "2024-02-27T19:00:00.000Z"
    },
    {
      "provider": "github",
      "avatar": "https://avatars.githubusercontent.com/u/12345",
      "name": "John Doe",
      "email": "john@example.com",
      "linkedAt": "2024-02-27T18:30:00.000Z"
    }
  ]
}
```

**Test Cases**:
- ✅ Test with no linked providers (should return empty array)
- ✅ Test with multiple providers
- ✅ Test with invalid/expired JWT token (should return 401)

### 9. Provider Unlinking with Metadata

**Purpose**: Test unlinking providers while preserving metadata history.

**Steps**:
1. Link a provider and verify metadata is stored
2. Unlink the provider using the DELETE endpoint:

```bash
curl -X DELETE "http://localhost:3000/api/me/oauth/google" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Behavior**:
- Should return success message
- OAuthAccount should be soft-deleted (deletedAt field set)
- Original metadata remains in database for audit purposes

### 10. Provider-Specific Metadata Testing

**Purpose**: Verify each provider returns correct metadata format.

**Steps**:
1. Link accounts from different providers
2. Check the metadata for each:
   - **Google**: Should have picture URL, email, name
   - **GitHub**: Should have avatar_url, email, name
   - **Facebook**: Should have picture data.url, email, name
   - **LinkedIn**: Should have picture, email, name
   - **Microsoft**: Should have displayName, email
   - **Apple**: Minimal data (handled during sign-in)

**Expected Behavior**:
- Each provider should return appropriate metadata
- Avatar URLs should be valid and accessible
- Email should be provider-verified

## 🧪 How to Test This Feature - Complete Step-by-Step Guide

### **Step 1: Application Setup**

**1.1 Start Your Application**
```bash
# Navigate to your project directory
cd /Users/samuelolabode/Documents/dev/voult

# Start the application
npm start
# or
node src/index.js

# Verify it's running at http://localhost:3000
```

**1.2 Access Developer Dashboard**
- Open your browser and go to `http://localhost:3000/dashboard`
- Log in with your developer account
- You should see your existing apps or option to create new ones

**1.3 Create Test App (if needed)**
- Click "Create New App" or similar
- Fill in app name: "Test OAuth App"
- Set callback URL: `http://localhost:3000/api/google/callback` (for testing)
- Note the App ID from the URL or app details page

### **Step 2: Configure OAuth Providers**

**2.1 Google OAuth Setup**
1. Go to your app settings in the dashboard
2. Navigate to "Google OAuth" configuration
3. Enter your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
   - Redirect URI: `http://localhost:3000/api/google/callback`
4. Enable Google OAuth and save

**2.2 GitHub OAuth Setup**
1. Navigate to "GitHub OAuth" configuration
2. Enter your GitHub OAuth credentials:
   - Client ID: Your GitHub OAuth client ID
   - Client Secret: Your GitHub OAuth client secret
   - Redirect URI: `http://localhost:3000/api/github/callback`
3. Enable GitHub OAuth and save

**2.3 Verify Provider Status**
```bash
# Test the provider visibility endpoint
curl -X GET "http://localhost:3000/api/YOUR_APP_ID"

# Expected response:
{
  "providers": {
    "google": true,
    "github": true,
    "facebook": false,
    "linkedin": false,
    "apple": false,
    "microsoft": false
  }
}
```

### **Step 3: Test OAuth Flow with Metadata**

**3.1 Link Google Account**
1. Navigate to your app's OAuth linking page (typically `/app/{id}/link/google`)
2. Click "Link Google Account"
3. You'll be redirected to Google's OAuth consent screen
4. Sign in with your Google account and authorize
5. You should be redirected back to your app with success message

**3.2 Verify Metadata Storage in Database**
```bash
# Connect to MongoDB (adjust connection string as needed)
mongo "mongodb://localhost:27017/your_database_name"

# Find the OAuth account document
db.OAuthAccounts.find({
  provider: "google"
}).pretty()

# Expected structure:
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),
  "app": ObjectId("..."),
  "provider": "google",
  "providerUserId": "123456789",
  "profile": {
    "email": "your.email@gmail.com",
    "name": "Your Name",
    "avatar": "https://lh3.googleusercontent.com/...",
    "raw": {
      "sub": "123456789",
      "email": "your.email@gmail.com",
      "name": "Your Name",
      "picture": "https://lh3.googleusercontent.com/...",
      "verified_email": true
    }
  },
  "accessToken": "...",
  "refreshToken": "...",
  "tokenExpiresAt": ISODate("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

**3.3 Link GitHub Account**
1. Navigate to your app's GitHub OAuth linking page
2. Click "Link GitHub Account"
3. Sign in to GitHub and authorize your app
4. Verify success and check database:
```bash
# Check GitHub OAuth account
db.OAuthAccounts.find({
  provider: "github"
}).pretty()

# Should show GitHub-specific metadata:
{
  "profile": {
    "email": "your.email@github.com",
    "name": "Your Name",
    "avatar": "https://avatars.githubusercontent.com/u/12345",
    "raw": {
      "login": "yourusername",
      "id": 12345,
      "avatar_url": "https://avatars.githubusercontent.com/u/12345",
      "name": "Your Name",
      "email": "your.email@github.com"
    }
  }
}
```

### **Step 4: Test User OAuth Management API**

**4.1 Get JWT Token**
1. Log in to your app as an end user (not developer)
2. Complete login flow to get JWT token
3. Or use the authentication endpoint:
```bash
# Login to get JWT token
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'

# Response should include:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**4.2 Test User OAuth Management Endpoint**
```bash
# Replace YOUR_JWT_TOKEN with actual token
curl -X GET "http://localhost:3000/api/me/oauth" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "providers": [
    {
      "provider": "google",
      "avatar": "https://lh3.googleusercontent.com/a/...",
      "name": "John Doe",
      "email": "john.doe@gmail.com",
      "linkedAt": "2024-02-27T19:00:00.000Z"
    },
    {
      "provider": "github",
      "avatar": "https://avatars.githubusercontent.com/u/12345",
      "name": "John Doe",
      "email": "john.doe@github.com",
      "linkedAt": "2024-02-27T18:30:00.000Z"
    }
  ]
}
```

**4.3 Test with No Linked Providers**
```bash
# Create a new user account with no linked providers
curl -X GET "http://localhost:3000/api/me/oauth" \
  -H "Authorization: Bearer NEW_USER_JWT_TOKEN"

# Expected response:
{
  "success": true,
  "providers": []
}
```

### **Step 5: Test Provider Unlinking**

**5.1 Unlink Google Account**
```bash
# Unlink Google provider
curl -X DELETE "http://localhost:3000/api/me/oauth/google" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "message": "Provider unlinked successfully"
}
```

**5.2 Verify Soft Delete in Database**
```bash
# Check that the account was soft-deleted
db.OAuthAccounts.find({
  provider: "google",
  user: ObjectId("YOUR_USER_ID")
}).pretty()

# Should show deletedAt field:
{
  "deletedAt": ISODate("2024-02-27T19:30:00.000Z"),
  // ... other fields remain
}
```

**5.3 Test Safety Validation**
```bash
# Try to unlink the last provider when user has no password
# Should return error:
{
  "error": "NO_AUTH_METHOD_LEFT"
}
```

### **Step 6: Test App Isolation**

**6.1 Create Second App**
1. In developer dashboard, create "Test App 2"
2. Configure only GitHub OAuth for this app
3. Note the new App ID

**6.2 Test Different Provider Configurations**
```bash
# Check App 1 providers (should have Google enabled)
curl -X GET "http://localhost:3000/api/APP1_ID/providers"

# Check App 2 providers (should have GitHub enabled)
curl -X GET "http://localhost:3000/api/APP2_ID/providers"
```

**6.3 Test Cross-App Isolation**
1. Link Google to App 1
2. Link GitHub to App 2
3. Verify each app only sees its own linked providers:
```bash
# User linked to App 1 should only see Google
# User linked to App 2 should only see GitHub
```

### **Step 7: Test Provider-Specific Metadata**

**7.1 Test Each Provider Type**

**Google Metadata:**
- Should include `picture` URL
- Should have `verified_email: true`
- Should have `sub` as stable user ID

**GitHub Metadata:**
- Should include `avatar_url`
- Should have `login` username
- May have public email or null

**Facebook Metadata:**
- Should include nested `picture.data.url`
- Should have `name` field
- May have email if permissions granted

**LinkedIn Metadata:**
- Should include `picture` URL
- Should have `given_name` and `family_name`
- Should have verified email

**7.2 Verify Metadata Quality**
```bash
# Check that avatar URLs are accessible
curl -I "https://lh3.googleusercontent.com/..."
# Should return 200 OK

# Verify email formats
# Google: user@gmail.com
# GitHub: user@users.noreply.github.com (if private)
# Facebook: may be null if not shared
```

### **Step 8: Test Error Scenarios**

**8.1 Test Disabled Provider**
1. Disable Google OAuth in app settings
2. Try to link Google account
3. Should receive `403 Forbidden` with `"PROVIDER_DISABLED_FOR_THIS_APP"`

**8.2 Test Invalid JWT Token**
```bash
# Use expired or invalid token
curl -X GET "http://localhost:3000/api/me/oauth" \
  -H "Authorization: Bearer INVALID_TOKEN"

# Should return 401 Unauthorized
```

**8.3 Test Non-existent App**
```bash
# Use invalid app ID
curl -X GET "http://localhost:3000/api/INVALID_APP_ID/providers"

# Should return 404 Not Found
```

### **Step 9: Test Frontend Integration**

**9.1 Account Dashboard Display**
1. Navigate to user account dashboard
2. Verify linked providers show:
   - Provider icons/logos
   - User avatars
   - Display names
   - "Unlink" buttons

**9.2 Link/Unlink UI**
1. Test "Link Google Account" button
2. Test "Unlink" buttons for each provider
3. Verify success/error messages display properly

### **Step 10: Production Readiness Checks**

**10.1 Performance Testing**
```bash
# Test with multiple linked providers
# Verify API response times are acceptable (< 500ms)

# Test with large user base
# Verify database queries are optimized
```

**10.2 Security Testing**
```bash
# Verify JWT tokens are properly validated
# Verify app isolation prevents cross-app access
# Verify sensitive data (secrets) are not exposed in responses
```

**10.3 Data Integrity**
```bash
# Verify metadata updates on relink
# Verify soft deletes preserve audit trail
# Verify app deletion cascades properly
```

## Manual Testing Commands

### Test Provider Visibility
```bash
# Replace {appId} with your actual app ID
curl -X GET "http://localhost:3000/api/{appId}/providers" \
  -H "Content-Type: application/json"
```

### Test User OAuth Management
```bash
# Replace YOUR_JWT_TOKEN with actual token
curl -X GET "http://localhost:3000/api/me/oauth" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Provider Unlinking
```bash
# Replace YOUR_JWT_TOKEN and provider name
curl -X DELETE "http://localhost:3000/api/me/oauth/google" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test OAuth Callback (should fail if disabled)
```bash
# This simulates an OAuth callback - replace values as needed
curl -X GET "http://localhost:3000/api/google/callback?code=test_code&state=test_state" \
  -H "Content-Type: application/json"
```

## Debugging Tips

1. **Check Logs**: Monitor server logs for OAuth-related errors
2. **Network Inspection**: Use browser dev tools to inspect OAuth redirect URLs
3. **Database Verification**: Check the `apps` and `OAuthAccounts` collections to verify configurations
4. **State Parameter**: Ensure the OAuth state parameter includes the correct app ID
5. **Metadata Inspection**: Use MongoDB queries to inspect OAuthAccount documents:
   ```javascript
   db.OAuthAccounts.find({ user: ObjectId("...") }).pretty()
   ```

## Expected Error Responses

- `403 Forbidden`: `"PROVIDER_DISABLED_FOR_THIS_APP"` - Provider disabled for app
- `404 Not Found`: `"APP_NOT_FOUND"` - Invalid or inactive app
- `400 Bad Request`: `"INVALID_OAUTH_CALLBACK"` - Missing code or state parameters
- `500 Internal Server Error`: `"OAUTH_CALLBACK_FAILED"` - Server-side OAuth error
- `401 Unauthorized`: `"NO_AUTH_METHOD_LEFT"` - Cannot unlink last auth method

## Success Indicators

- ✅ Provider visibility endpoint returns correct enabled/disabled status
- ✅ Disabled providers block OAuth callbacks with proper error messages
- ✅ Enabled providers allow OAuth flows to complete successfully
- ✅ Each app maintains independent provider configurations
- ✅ Validation prevents disabling providers with linked user accounts
- ✅ Token exchange uses app-specific credentials
- ✅ OAuth accounts store rich profile metadata (email, name, avatar)
- ✅ User OAuth management endpoint returns structured provider data
- ✅ Provider unlinking works with safety checks
- ✅ Each provider returns appropriate metadata format
- ✅ App isolation prevents provider conflicts between apps
