# CSRF-Required Forms

This document lists all form templates in the application that perform `POST` actions and should include a CSRF token field.

## Forms that need CSRF integration

- `views/partials/header.ejs`
  - `POST /logout`

- `views/auth/login.ejs`
  - `POST /login`

- `views/auth/register.ejs`
  - `POST /register`

- `views/forgottenPassword/forgot-password.ejs`
  - `POST /forgot-password`

- `views/forgottenPassword/reset-password.ejs`
  - `POST /reset-password/<%= token %>`

- `views/user/settings.ejs`
  - `POST /settings`
  - `POST /settings/email/request-change`
  - `POST /settings/unlink/google`
  - `POST /settings/unlink/github`
  - `POST /settings/password/set`
  - `POST /settings/password/change`

- `views/user/enterPassword.ejs`
  - `POST /delete-account` (two forms)

- `views/app/new.ejs`
  - `POST /app`

- `views/app/edit.ejs`
  - `POST /app/<%= app._id %>?_method=PUT`
  - `POST /app/<%= app._id %>?_method=DELETE`

- `views/app/manage.ejs`
  - `POST /app/<%= app._id %>/rotate-secret`
  - `POST /app/<%= app._id %>/toggle`
  - `POST /app/<%= app._id %>?_method=DELETE`

- `views/app/google/googleOAuthForm.ejs`
  - `POST /app/<%= app._id %>/google-oauth`
  - `POST /app/<%= app._id %>/update-google-oauth`

- `views/app/github/githubOauthForm.ejs`
  - `POST /app/<%= app._id %>/github-oauth`
  - `POST /app/<%= app._id %>/github-oauth` (update form)

- `views/app/github/githubOauthedit.ejs`
  - `POST /app/<%= app._id %>/google-oauth`

- `views/app/facebook/oauthForm.ejs`
  - `POST /app/<%= app._id %>/facebook-oauth`
  - `POST /app/<%= app._id %>/update-facebook-oauth`

- `views/app/apple/oauthForm.ejs`
  - `POST /app/<%= app._id %>/apple-oauth`
  - `POST /app/<%= app._id %>/update-apple-oauth`

- `views/app/microsoft/oauthForm.ejs`
  - `POST /app/<%= app._id %>/microsoft-oauth`
  - `POST /app/<%= app._id %>/update-microsoft-oauth`

- `views/app/linkedin/oauthForm.ejs`
  - `POST /app/<%= app._id %>/linkedin-oauth`
  - `POST /app/<%= app._id %>/update-linkedin-oauth`
