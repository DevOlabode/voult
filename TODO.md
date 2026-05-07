# TODO

## Magic Link feature hardening

- [x] Create TODO scaffold for magic link hardening.
- [ ] Add API rate limiting + middleware protection for magic link routes (`routes/api/magicLink.js`).
- [ ] Enforce redirectUri allowlisting via stored app data (or validateCallbackUrl reuse).
- [ ] Replace manual `res.status(...).json(...)` with `ApiError` usage for consistent API error format.
- [x] Make token validation atomic (claim token in DB so it can’t be used twice under race conditions).
- [x] Ensure validate endpoint checks user/app active state (`user.isActive`, app active) and aligns with existing auth rules.
- [x] Update `MagicLinkToken` model with atomic claim method.
- [ ] Run quick smoke tests with curl for send + validate.





