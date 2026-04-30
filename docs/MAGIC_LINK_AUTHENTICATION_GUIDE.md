# Magic Link Authentication Implementation Guide

This guide explains how to complete the magic link authentication feature to find users, generate JWT tokens, and log them into their app.

## Current State

The magic link system currently:
- ✅ Generates secure tokens
- ✅ Stores tokens in the database with expiration
- ✅ Sends tokens via email
- ✅ Validates tokens when users click the link

**What's missing:**
- ❌ Finding/creating the end user
- ❌ Generating JWT tokens for authentication
- ❌ Logging the user into their app

## Implementation Steps

### Step 1: Update the Magic Link Token Model

The `MagicLinkToken` model needs to store the app association so we know which app the user is logging into.

**File: `models/MagicLinkToken.js`**

```javascript
const mongoose = require('mongoose');
const crypto = require('crypto');

const magicLinkTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  tokenHash: {
    type: String,
    required: true,
    select: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: Date
}, { timestamps: true });

// Index for cleanup and lookup
magicLinkTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
magicLinkTokenSchema.index({ email: 1 });

// Static method to hash tokens
magicLinkTokenSchema.statics.hashToken = function(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

// Static method to find and validate a token
magicLinkTokenSchema.statics.findAndValidateToken = async function(rawToken) {
  const tokenHash = this.hashToken(rawToken);
  const tokenDoc = await this.findOne({ tokenHash, used: false })
    .select('+tokenHash')
    .populate('app');
  
  if (!tokenDoc) {
    return null;
  }
  
  if (tokenDoc.expiresAt < new Date()) {
    // Token expired, delete it
    await this.deleteOne({ _id: tokenDoc._id });
    return null;
  }
  
  return tokenDoc;
};

// Method to mark token as used
magicLinkTokenSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

module.exports = mongoose.models.MagicLinkToken || mongoose.model('MagicLinkToken', magicLinkTokenSchema);
```

### Step 2: Update the Magic Link Controller

**File: `controllers/api/magicLink.js`**

```javascript
const { magicLinkEmail } = require('../../services/magicLinkEmail');
const MagicLinkToken = require('../../models/MagicLinkToken');
const EndUser = require('../../models/endUser');
const App = require('../../models/app');
const { createTokens } = require('../../utils/createTokens');
const crypto = require('crypto');

/**
 * Send Magic Link
 * POST /api/send-magic-link
 * Body: { email: string, clientId: string }
 */
module.exports.sendLink = async (req, res) => {
  try {
    const { email, clientId } = req.body;

    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required'
      });
    }

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID (appId) is required'
      });
    }

    // Find the app
    const app = await App.findOne({ clientId });
    if (!app || !app.isActive) {
      return res.status(404).json({
        success: false,
        message: 'App not found or inactive'
      });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Create and save the token record
    const tokenDoc = new MagicLinkToken({
      email: email.toLowerCase().trim(),
      app: app._id,
      tokenHash: MagicLinkToken.hashToken(rawToken),
      expiresAt
    });
    
    await tokenDoc.save();

    // Build the magic link URL
    const baseUrl = process.env.APP_URL || 'https://voult.dev';
    const magicLinkURL = `${baseUrl}/magic-link?token=${rawToken}`;

    // Send the email
    await magicLinkEmail(email, magicLinkURL);

    res.status(200).json({
      success: true,
      message: 'Magic link sent successfully. Please check your email.'
    });

  } catch (err) {
    console.error('Magic link error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send magic link. Please try again later.'
    });
  }
};

/**
 * Validate Magic Link Token and Authenticate User
 * POST /api/validate-magic-link
 * Body: { token: string }
 */
module.exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Find and validate the token
    const tokenDoc = await MagicLinkToken.findAndValidateToken(token);

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find or create the end user
    let user = await EndUser.findOne({ 
      email: tokenDoc.email, 
      app: tokenDoc.app 
    });

    if (!user) {
      // User doesn't exist - this is an error per requirements
      // Mark token as used to prevent reuse
      await tokenDoc.markAsUsed();
      
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please register first.'
      });
    }

    // Mark token as used
    await tokenDoc.markAsUsed();

    // Update user's last login and email verification
    user.lastLoginAt = new Date();
    user.isEmailVerified = true;
    await user.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = await createTokens({
      user,
      app: tokenDoc.app,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          isEmailVerified: user.isEmailVerified
        }
      }
    });

  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to validate token'
    });
  }
};
```

### Step 3: Update Routes

**File: `routes/api/magicLink.js`**

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/magicLink');
const catchAsync = require('../../utils/catchAsync');

router.post('/send-magic-link', catchAsync(controller.sendLink));
router.post('/validate-magic-link', catchAsync(controller.validateToken));

module.exports = router;
```

### Step 4: Update the Email Service (Optional)

You might want to update the email to mention that the user must already have an account:

**File: `services/magicLinkEmail.js`**

Update the email body text to:
```html
<tr>
  <td style="font-size:14px; color:#444; line-height:1.6;">
    Click the button below to securely sign in to your existing account.
    This link will expire in 10 minutes.
  </td>
</tr>
```

## API Usage Examples

### 1. Request Magic Link

```bash
curl -X POST http://localhost:3000/api/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "clientId": "app_abc123def456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent successfully. Please check your email."
}
```

### 2. Validate Token and Login

```bash
curl -X POST http://localhost:3000/api/validate-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123...xyz789"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60d5ecb5c9c7a7001f3e4b5a",
      "email": "user@example.com",
      "fullName": "John Doe",
      "isEmailVerified": true
    }
  }
}
```

**Error Response (User Not Found):**
```json
{
  "success": false,
  "message": "No account found with this email. Please register first."
}
```

## Frontend Integration Example

```javascript
// 1. Request magic link
async function requestMagicLink(email, clientId) {
  const response = await fetch('/api/send-magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, clientId })
  });
  return await response.json();
}

// 2. Validate token and login
async function validateMagicLink(token) {
  const response = await fetch('/api/validate-magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    alert(data.message);
  }
}

// 3. Handle magic link click
// If user clicks link: https://voult.dev/magic-link?token=abc123
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  validateMagicLink(token);
}
```

## Testing Checklist

- [ ] Send magic link with valid email and clientId
- [ ] Verify email is received
- [ ] Click magic link with valid token for existing user
- [ ] Verify JWT tokens are returned
- [ ] Verify user is logged in
- [ ] Test with non-existent user (should return error)
- [ ] Test with expired token (should return error)
- [ ] Test with invalid token (should return error)
- [ ] Test token can only be used once
- [ ] Verify lastLoginAt is updated
- [ ] Verify isEmailVerified is set to true

## Security Considerations

1. **Token Expiration**: Tokens expire after 10 minutes
2. **One-Time Use**: Tokens are marked as used after validation
3. **HTTPS Only**: Magic links should only be sent over HTTPS in production
4. **Rate Limiting**: Consider adding rate limiting to prevent email spam
5. **User Existence**: The system only works for existing users (no auto-registration)

## Next Steps

After implementing this guide, the magic link authentication will be complete and ready for production use.