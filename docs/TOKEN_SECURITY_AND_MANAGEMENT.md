# Token Security and Management Guide

## Table of Contents
- [Token Storage Security](#token-storage-security)
- [Token Management for Developers](#token-management-for-developers)
- [Best Practices](#best-practices)

---

## Token Storage Security

### 1. Your Own JWT Refresh Tokens ✅ **Excellent Implementation**

Your implementation for storing refresh tokens (`models/refreshToken.js`) follows security best practices:

- **Hashed storage**: Store `tokenHash` (SHA-256 hash) instead of raw tokens
- **Expiration tracking**: `expiresAt` field with automatic TTL deletion
- **Revocation support**: `revokedAt` and `replacedByTokenHash` fields for token rotation
- **Audit trail**: `ipAddress`, `userAgent`, `lastUsedAt` for security monitoring

**This is the correct way to store refresh tokens.**

### 2. OAuth Provider Tokens ⚠️ **Security Concern**

Your `OAuthAccount` model stores **plaintext** `accessToken` and `refreshToken` from external providers (Google, GitHub, Facebook, etc.). This is risky:

#### Security Risks:
1. **Database breach = compromised accounts**: Attackers gain access to all linked OAuth accounts
2. **Provider ToS violations**: Many providers prohibit storing refresh tokens in plaintext
3. **Lateral movement**: Compromised tokens could access users' data on provider platforms
4. **Compliance issues**: May violate GDPR, CCPA, or other regulations

#### Recommendations:

**If you DON'T need the tokens:**
- Remove `accessToken` and `refreshToken` fields from `OAuthAccount` schema
- Stop storing them in `handleOAuthCallback.js` and `oauth.js`

**If you DO need the tokens (e.g., for API integrations):**
1. **Encrypt at rest**: Use AES-256-GCM to encrypt tokens before storing
2. **Use a secrets manager**: Consider HashiCorp Vault, AWS Secrets Manager
3. **Implement key rotation**: Regularly rotate encryption keys
4. **Minimize scopes**: Only request minimum OAuth scopes needed
5. **Add expiration cleanup**: Auto-delete expired tokens
6. **Audit access**: Log when tokens are accessed/used

---

## Token Management for Developers

### The Problem: Manual Token Copying

When testing your application, you may find yourself:
- Manually copying access tokens from Postman
- Pasting them into `.env` files
- Repeating this every 15 minutes when tokens expire

**This is not the intended workflow!**

### The Solution: Use Refresh Tokens

Your authentication system already has a proper token refresh mechanism:

1. **Login** → Get both `accessToken` (15 min) and `refreshToken` (30 days)
2. **Use accessToken** for API requests
3. **When accessToken expires** → Use `refreshToken` to get a new `accessToken` automatically
4. **No manual copying needed!**

### Refresh Endpoint Details

**Endpoint**: `POST /api/session/refresh`

**Request Body**:
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

**Response**:
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

**Note**: The refresh token rotates on each use for security. Always save the new refresh token!

---

## Implementation Examples

### Option 1: Automatic Refresh in Your Application

```javascript
// tokenManager.js
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = process.env.REFRESH_TOKEN;
    this.tokenExpiry = null;
  }

  async getValidAccessToken() {
    // Return cached token if still valid (with 1-minute buffer)
    if (this.accessToken && this.tokenExpiry > Date.now() + 60000) {
      return this.accessToken;
    }

    // Refresh token
    const response = await fetch('/api/session/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken, refreshToken } = await response.json();
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Decode JWT to get expiry (or estimate 15 minutes)
    this.tokenExpiry = Date.now() + 15 * 60 * 1000;
    
    // Update .env file with new refresh token
    this.updateEnvFile('REFRESH_TOKEN', refreshToken);
    
    return accessToken;
  }

  updateEnvFile(key, value) {
    const fs = require('fs');
    const envPath = '.env';
    let content = fs.readFileSync(envPath, 'utf8');
    content = content.replace(
      new RegExp(`^${key}=.*`, 'm'),
      `${key}=${value}`
    );
    fs.writeFileSync(envPath, content);
  }
}

// Usage
const tokenManager = new TokenManager();
const token = await tokenManager.getValidAccessToken();
```

### Option 2: Development Script for Token Refresh

```javascript
// scripts/refresh-token.js
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function refreshToken() {
  const refresh = process.env.REFRESH_TOKEN;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await axios.post(
      `${baseUrl}/api/session/refresh`,
      { refreshToken: refresh }
    );
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    console.log('✅ Token refreshed successfully!');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', newRefreshToken);
    
    // Update .env file
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(
      /^REFRESH_TOKEN=.*/m,
      `REFRESH_TOKEN=${newRefreshToken}`
    );
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ .env file updated with new refresh token');
    
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    console.log('You may need to login again to get a new refresh token.');
  }
}

refreshToken();
```

**Usage**: `node scripts/refresh-token.js`

### Option 3: Postman Environment Setup

1. **Create environment variables**:
   - `baseUrl`: Your API base URL
   - `accessToken`: Will be auto-updated
   - `refreshToken`: Your refresh token (update manually once)

2. **Add Pre-request Script** to your collection:
```javascript
// Auto-refresh token before each request
if (pm.environment.get('refreshToken')) {
    pm.sendRequest({
        url: pm.environment.get('baseUrl') + '/api/session/refresh',
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: {
            mode: 'raw',
            raw: JSON.stringify({ 
                refreshToken: pm.environment.get('refreshToken') 
            })
        }
    }, function (err, res) {
        if (res.code === 200) {
            const json = res.json();
            pm.environment.set('accessToken', json.accessToken);
            pm.environment.set('refreshToken', json.refreshToken);
            console.log('Token refreshed automatically');
        }
    });
}
```

3. **Use `{{accessToken}}`** in your Authorization header:
```
x-client-token: Bearer {{accessToken}}
```

### Option 4: Increase Token Expiry for Development

**Only for development environments!**

In `utils/jwt.js`:
```javascript
const JWT_EXPIRES_IN = process.env.NODE_ENV === 'development' ? '30d' : '15m';
```

⚠️ **Warning**: Never use long-lived access tokens in production!

---

## Best Practices Summary

### For Production:
1. ✅ Keep access tokens short-lived (15 minutes is good)
2. ✅ Use secure refresh token rotation
3. ✅ Store refresh tokens hashed in database
4. ✅ Never store OAuth provider tokens in plaintext
5. ✅ Implement proper token revocation

### For Development/Testing:
1. ✅ Use refresh tokens instead of manual copying
2. ✅ Store refresh tokens in environment variables
3. ✅ Automate token refresh in your test scripts
4. ✅ Consider longer token expiry only in dev environment
5. ✅ Use tools like Postman's auto-refresh feature

### What NOT to Do:
- ❌ Don't store access tokens in `.env` files (they expire too quickly)
- ❌ Don't manually copy tokens from Postman repeatedly
- ❌ Don't increase access token expiry in production
- ❌ Don't store OAuth provider tokens without encryption
- ❌ Don't ignore token expiration errors

---

## Quick Reference

### Token Lifetimes:
- **Access Token**: 15 minutes
- **Refresh Token**: 30 days
- **Email Verification Token**: 24 hours
- **Password Reset Token**: 30 minutes

### Key Endpoints:
- `POST /api/auth/login` - Get initial tokens
- `POST /api/session/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke all sessions
- `GET /api/session/sessions` - List active sessions
- `DELETE /api/session/sessions/:id` - Revoke specific session

### Security Features:
- Refresh token rotation (new token on each refresh)
- Reuse detection (compromised token detection)
- Session tracking (IP, user agent)
- Automatic cleanup of expired tokens
- Token versioning for immediate revocation

---

## Need Help?

If you're having trouble implementing token refresh in your application, consider:

1. Reviewing the refresh endpoint in `controllers/api/session.js`
2. Checking the Postman collection in `docs/postman/`
3. Reading the API documentation in `docs/openapi.yaml`
4. Reaching out to the Voult team for support

Remember: Proper token management is crucial for both security and developer experience!