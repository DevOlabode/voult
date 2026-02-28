# Testing Per-App OAuth Provider Enable/Disable Feature

This guide provides step-by-step instructions to test the new per-app OAuth provider functionality.

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

## Manual Testing Commands

### Test Provider Visibility
```bash
# Replace {appId} with your actual app ID
curl -X GET "http://localhost:3000/api/{appId}/providers" \
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
3. **Database Verification**: Check the `apps` collection to verify provider configurations
4. **State Parameter**: Ensure the OAuth state parameter includes the correct app ID

## Expected Error Responses

- `403 Forbidden`: `"PROVIDER_DISABLED_FOR_THIS_APP"` - Provider disabled for app
- `404 Not Found`: `"APP_NOT_FOUND"` - Invalid or inactive app
- `400 Bad Request`: `"INVALID_OAUTH_CALLBACK"` - Missing code or state parameters
- `500 Internal Server Error`: `"OAUTH_CALLBACK_FAILED"` - Server-side OAuth error

## Success Indicators

- ✅ Provider visibility endpoint returns correct enabled/disabled status
- ✅ Disabled providers block OAuth callbacks with proper error messages
- ✅ Enabled providers allow OAuth flows to complete successfully
- ✅ Each app maintains independent provider configurations
- ✅ Validation prevents disabling providers with linked user accounts
- ✅ Token exchange uses app-specific credentials