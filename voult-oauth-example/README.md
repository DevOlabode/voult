# Voult-Style Google OAuth Implementation

Complete copy-paste implementation for **any Node/Express codebase**.

## 🚀 Quick Start

```bash
cd voult-oauth-example
npm install
# Start MongoDB
npm start
```

1. Visit `http://localhost:3001`
2. Click "Configure Test App" → Add Google Client ID/Secret
3. Test OAuth at `http://localhost:3001/public`

## 🎯 How It Works (Voult Architecture)

```
1. Dashboard: POST /app/:id/google-oauth → Saves app.googleOAuth
2. Frontend: POST /api/google/authorize → Returns Google authUrl  
3. Callback: GET /api/google/callback → Exchanges code → Returns tokens
4. ID Token: POST /api/google/login → Instant verification (no redirect)
```

**Developer NEVER touches .env** - all config stored per-app in DB.

## 📱 Production Checklist

- [ ] Replace mock user handling with your User model
- [ ] Add developer authentication middleware
- [ ] Use HTTPS
- [ ] Add rate limiting
- [ ] Implement token encryption (see Voult docs/OAUTH_IMPROVEMENTS.md)

## 🔧 Customization

**Add new app**: `POST /api/app {name: "My App"}`
**Get APP_ID**: Response has `_id`
**SDK**: Copy `public/index.html` logic

**Matches Supabase/Clerk UX exactly!**
