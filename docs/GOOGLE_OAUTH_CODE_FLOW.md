# Google OAuth Authorization Code Flow Guide

This guide explains how to implement Google OAuth in your test app using the authorization code flow with your Voult server.

## Overview

Your Voult server now supports the standard OAuth 2.0 authorization code flow, which is the most secure and recommended way to implement Google OAuth for web applications.

## Flow Diagram

```
1. Your App → Voult Server: Request auth URL
2. Voult Server → Your App: Return Google login URL
3. Your App → User: Redirect to Google
4. User → Google: Login and authorize
5. Google → Your App: Redirect with authorization code
6. Your App → Voult Server: Send code to callback endpoint
7. Voult Server → Google: Exchange code for tokens
8. Voult Server → Your App: Return JWT tokens and user data
```

## API Endpoints

### 1. Generate Authorization URL

**Endpoint:** `POST /api/oauth/:provider/authorize`

**Purpose:** Generate a Google login URL for your users.

**Parameters:**
- `provider` (URL parameter): OAuth provider name (e.g., 'google', 'github', 'facebook')
- `intent` (body): What action to perform after login ('register', 'login', or 'link')
- `redirectUri` (body): Where to redirect after Google login (must match your app's callback URL)
- `appId` (header/body/query): Your Voult app ID (can be sent via `X-App-ID` header, query parameter, or body)
- `userId` (body, optional): Required only for 'link' intent - the user ID to link the provider to

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/oauth/google/authorize \
  -H "Content-Type: application/json" \
  -H "X-App-ID: your-app-id-here" \
  -d '{
    "intent": "register",
    "redirectUri": "https://your-app.com/oauth-callback"
  }'
```

**Example Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent&state=...",
  "provider": "google",
  "intent": "register",
  "expiresInSeconds": 600
}
```

### 2. Handle OAuth Callback

**Endpoint:** `GET /api/oauth/:provider/callback`

**Purpose:** Process the authorization code returned by Google and complete the login/registration.

**Parameters:**
- `provider` (URL parameter): OAuth provider name
- `code` (query parameter): Authorization code from Google
- `state` (query parameter): Encoded state containing intent, appId, and redirectUri

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/oauth/google/callback?code=4/0AX4XfWh...&state=..."
```

**Example Response (for register/login intent):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Response (for link intent):**
```json
{
  "message": "ACCOUNT_LINKED_SUCCESSFULLY"
}
```

## Implementation Examples

### Frontend Implementation (Vanilla JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Test App</title>
</head>
<body>
  <h1>Welcome to My Test App</h1>
  
  <button id="google-login-btn">Sign in with Google</button>
  
  <script>
    const VOULT_SERVER_URL = 'http://localhost:3000';
    const APP_ID = 'your-app-id-here';
    
    // Step 1: Start OAuth flow
    document.getElementById('google-login-btn').addEventListener('click', async () => {
      try {
        // Request authorization URL from Voult server
        const response = await fetch(`${VOULT_SERVER_URL}/api/oauth/google/authorize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-ID': APP_ID
          },
          body: JSON.stringify({
            intent: 'register', // or 'login'
            redirectUri: window.location.origin + '/oauth-callback'
          })
        });
        
        const { authUrl } = await response.json();
        
        // Redirect user to Google login
        window.location.href = authUrl;
      } catch (error) {
        console.error('Error starting OAuth flow:', error);
        alert('Failed to start Google login');
      }
    });
    
    // Step 2: Handle callback
    if (window.location.pathname === '/oauth-callback') {
      handleOAuthCallback();
    }
    
    async function handleOAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code || !state) {
        alert('Invalid OAuth callback');
        return;
      }
      
      try {
        // Send code back to Voult server to exchange for tokens
        const response = await fetch(`${VOULT_SERVER_URL}/api/oauth/google/callback?code=${code}&state=${state}`);
        const result = await response.json();
        
        if (result.token) {
          // Store token and log user in
          localStorage.setItem('accessToken', result.token);
          
          // Redirect to dashboard or home page
          window.location.href = '/dashboard';
        } else {
          alert('Login failed: No token received');
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        alert('Failed to complete login');
      }
    }
  </script>
</body>
</html>
```

### React Implementation

```jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VOULT_SERVER_URL = 'http://localhost:3000';
const APP_ID = 'your-app-id-here';

function GoogleLoginButton() {
  const navigate = useNavigate();
  
  const handleGoogleLogin = async (intent = 'register') => {
    try {
      const response = await fetch(`${VOULT_SERVER_URL}/api/oauth/google/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': APP_ID
        },
        body: JSON.stringify({
          intent,
          redirectUri: `${window.location.origin}/oauth-callback`
        })
      });
      
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <button onClick={() => handleGoogleLogin('register')}>
      Sign up with Google
    </button>
  );
}

function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(location.search);
