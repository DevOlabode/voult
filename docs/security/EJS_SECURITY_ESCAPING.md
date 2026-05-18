# EJS Security & Output Escaping Guide

## Overview
This document outlines best practices for secure output handling in EJS templates, specifically focused on XSS (Cross-Site Scripting) prevention.

## Key Principles

### 1. Default Escaping with `<%= %>`
**Use `<%= %>` for all user-provided data** - This automatically escapes HTML special characters.

```ejs
<!-- ✅ CORRECT - HTML entities escaped -->
<h1>Welcome, <%= user.fullName %></h1>
<p>Email: <%= user.email %></p>
<div><%= userComment %></div>
```

**Output:**
- `<script>` becomes `&lt;script&gt;`
- `"` becomes `&quot;`
- `&` becomes `&amp;`
- Prevents XSS attacks

### 2. Raw HTML Output with `<%- %>`
**Only use `<%- %>` for trusted, pre-sanitized content** - This outputs HTML without escaping.

```ejs
<!-- ✅ CORRECT - For trusted markup (e.g., blog post body that was already sanitized) -->
<%- sanitizedBlogContent %>

<!-- ❌ AVOID - Never use with user input -->
<!-- <%- user.bio %> -->  <!-- DANGEROUS! -->
```

**When to use `<%- %>`:**
- Pre-sanitized HTML from your backend (e.g., rendered markdown)
- Static template markup (partials, fragments)
- Content already processed through DOMPurify or similar sanitizer

**When NOT to use `<%- %>`:**
- Direct user input (bios, comments, descriptions)
- Data from external APIs
- Anything not explicitly sanitized on the backend

### 3. JavaScript Context Escaping
When inserting data into JavaScript within templates:

```ejs
<!-- ✅ CORRECT - Data passed safely through data attributes -->
<div id="user-card" data-user-id="<%= user._id %>"></div>

<script>
  const userId = document.getElementById('user-card').dataset.userId;
  const userData = JSON.parse('<%= JSON.stringify(user) %>');
</script>

<!-- ✅ CORRECT - Using JSON for JavaScript objects -->
<script>
  const user = <%- JSON.stringify(user) %>;  // JSON structure is safe
</script>

<!-- ❌ AVOID - Direct variable insertion -->
<!-- <script>const name = "<%= userName %>";</script> -->
```

### 4. HTML Attributes
Always quote attribute values and escape user data:

```ejs
<!-- ✅ CORRECT - Quoted and escaped -->
<img src="<%= imageUrl %>" alt="<%= imageAlt %>" title="<%= title %>">
<a href="<%= profileUrl %>" class="<%= userClass %>"><%= userName %></a>

<!-- ❌ AVOID - Unquoted or unescaped attributes -->
<!-- <img src=<%= imageUrl %> alt=<%= imageAlt %>> -->
```

### 5. URL Attributes (href, src, etc.)
Validate and sanitize URLs before using:

```ejs
<!-- ✅ CORRECT - Validate protocol -->
<a href="<%= sanitizeUrl(user.website) %>">Visit Profile</a>

<!-- ✅ CORRECT - Use data: URLs carefully -->
<button onclick="handleClick('<%= userId %>')">Click</button>

<!-- ❌ AVOID - JavaScript protocol URLs from user input -->
<!-- <a href="<%= userLink %>">Link</a> --> 
<!-- where userLink could be "javascript:alert('xss')" -->
```

### 6. Template Include Security
When including partials:

```ejs
<!-- ✅ CORRECT - Pass sanitized data to partials -->
<% include('partials/userCard', { user: sanitizedUser, bio: sanitizeBio(user.bio) }) %>

<!-- ✅ CORRECT - Each partial is responsible for escaping its output -->
<!-- In partials/userCard.ejs: -->
<h3><%= user.name %></h3>
<p><%= bio %></p>
```

## Common XSS Attack Vectors & Prevention

### Attack Vector 1: Unescaped User Comments
```ejs
<!-- ❌ VULNERABLE -->
<div class="comment"><%-comment %></div>

<!-- ✅ SAFE -->
<div class="comment"><%= comment %></div>
```

### Attack Vector 2: HTML in User Profiles
```ejs
<!-- ❌ VULNERABLE -->
<div class="bio"><%- user.biography %></div>

<!-- ✅ SAFE -->
<div class="bio"><%= user.biography %></div>
```

### Attack Vector 3: Event Handler Injection
```ejs
<!-- ❌ VULNERABLE -->
<button onclick="navigate('<%= userLink %>')">Go</button>

<!-- ✅ SAFE - Use data attributes and event listeners -->
<button class="nav-btn" data-link="<%= userLink %>">Go</button>
<script>
  document.querySelector('.nav-btn').addEventListener('click', (e) => {
    navigate(e.target.dataset.link);
  });
</script>
```

### Attack Vector 4: Attribute Injection
```ejs
<!-- ❌ VULNERABLE - Unquoted attribute with user data -->
<div class="<%= userClass %>"></div>
<!-- If userClass = '" onload="alert(1) x="', renders as: -->
<!-- <div class="" onload="alert(1) x=""></div> -->

<!-- ✅ SAFE - Quoted and escaped -->
<div class="<%= userClass %>"></div>
<!-- Only special characters are escaped, can't break out of quotes -->
```

## Backend Processing Requirements

### Input Sanitization (server-side)
Before rendering data in templates, sanitize on the backend:

```javascript
// In your controller (controllers/api/auth.js)
const { sanitize } = require('../../middleware/inputSanitization');

const sanitizedFullName = sanitize(fullName);
const user = new EndUser({
  fullName: sanitizedFullName,
  email: sanitizedEmail,
  username: sanitizedUsername
});
```

### Storing Sanitized Data
Sanitize user input at the point of entry:
- During registration/signup
- When updating profile information
- On form submissions
- When processing rich content (markdown, WYSIWYG editors)

## Content Security Policy (CSP)

The application includes CSP headers via Helmet middleware (middleware/securityHeaders.js):

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],  // Inline scripts allowed in dev
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"]
  }
}
```

**Note:** In production, remove `'unsafe-inline'` from `scriptSrc` and `styleSrc`, and use external stylesheets with nonces or hashes.

## Testing XSS Prevention

Run XSS prevention tests:
```bash
npm test -- tests/xss.test.js
```

Tests validate:
- Input sanitization for email, username, fullName
- Rejection of HTML/script tags
- CSP headers are present
- Proper header configurations (X-Content-Type-Options, X-Frame-Options)

## Checklist for Developers

When adding new EJS templates:

- [ ] Use `<%= %>` for all user-provided data
- [ ] Only use `<%- %>` for explicitly sanitized/trusted content
- [ ] Quote all HTML attributes
- [ ] Validate URLs before rendering in href/src attributes
- [ ] Sanitize user input at the backend before storing
- [ ] Use data attributes instead of inline event handlers
- [ ] Never render arbitrary JavaScript from user input
- [ ] Test new forms/views for XSS vulnerabilities
- [ ] Keep CSP headers enabled in production
- [ ] Review this guide when uncertain about output escaping

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [EJS Documentation](https://ejs.co/)
- [Helmet.js Security Headers](https://helmetjs.github.io/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
