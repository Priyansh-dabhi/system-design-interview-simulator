# Authentication Audit Status Report

Date: 2026-05-14

## 1. Current authentication architecture overview

### Backend

- `POST /api/auth/register` creates a user and immediately issues an auth session.
- `POST /api/auth/login` verifies credentials and issues an auth session.
- `POST /api/auth/refresh` rotates refresh tokens and issues a new access token.
- `POST /api/auth/logout` revokes a provided refresh token.
- `POST /api/auth/logout-all` requires a valid access token and revokes all refresh sessions for the authenticated user.
- Protected interview routes currently exposed are:
  - `POST /api/interview/start_session`
  - `POST /api/interview/chat`
  - `POST /api/interview/summary`

### Token model

- Access tokens are JWTs signed with `ACCESS_TOKEN_SECRET` and expire after `15m` (`backend/src/config/auth.ts`).
- Refresh tokens are random 96-character hex strings generated with `crypto.randomBytes(48)`.
- Refresh tokens are hashed with SHA-256 before being stored in PostgreSQL.
- Refresh tokens are rotated on refresh and revoked on reuse/expiry.

### Frontend

- Login and registration dispatch Redux async thunks from `frontend/src/redux/slices/auth.ts`.
- The frontend stores:
  - refresh token in `AsyncStorage`
  - user object in `AsyncStorage`
  - access token only in Redux memory
- On app startup, `bootstrapAuth()` attempts to refresh the session using the stored refresh token before treating the user as authenticated.
- RTK Query wraps interview API requests with automatic `401` recovery through `baseQueryWithReauth`.

## 2. What is working correctly

### Registration

- Passwords are hashed with bcrypt before storage (`backend/src/utils/password.ts`).
- User emails are protected by a database unique constraint (`backend/prisma/schema.prisma`).
- Registration returns an authenticated session immediately after account creation.
- The Prisma `select` in `registerUser()` avoids returning the password hash to the client.

### Login

- Login uses `findUnique({ where: { email } })` and bcrypt password comparison.
- Access and refresh tokens are issued after successful credential verification.
- The client updates Redux auth state after successful login.

### Session persistence

- The frontend no longer restores an expired access token blindly.
- On startup, the app attempts a refresh using the stored refresh token before considering the session active.
- Access tokens are kept in memory rather than persisted directly, which limits storage exposure compared with persisting both tokens.
- A single in-flight refresh promise prevents multiple concurrent refresh calls from racing.

### Protected route middleware

- Interview routes are wrapped with JWT middleware in `backend/src/routes/interview.routes.ts`.
- Missing bearer tokens return `401 Unauthorized`.
- Expired access tokens return `401 Token expired`.
- Invalid tokens return `401 Invalid token`.

### Logout flows

- Normal logout clears client auth state and local storage even if the network request fails.
- Logout-all revokes all server-side refresh sessions for the authenticated user.

## 3. What is partially implemented

### Refresh-token based auth is implemented, but storage is not production-grade

- The refresh flow itself is solid:
  - hashed refresh tokens
  - server-side revocation
  - rotation on refresh
  - access token short TTL
- However, refresh tokens are stored in `AsyncStorage`, not secure device storage.
- This is acceptable for development, but weak for a production mobile auth system.

### Frontend navigation protection exists, but is state-based rather than capability-based

- `frontend/app/_layout.tsx` blocks unauthenticated navigation based on whether `state.auth.user` exists.
- Because `bootstrapAuth()` refreshes first, this is much better than the old optimistic restore approach.
- Still, navigation trust is based on a locally stored `user` object, not on a server-validated profile fetch.
- If the stored user becomes stale, deleted, or inconsistent with backend state, the UI can still show an authenticated shell until refresh fails.

### Token expiration UX is only partly smoothed

- Interview API requests retry automatically after a `401`.
- If refresh fails, the auth state is cleared.
- However, there is no centralized user-facing "session expired, please sign in again" path, so expiry can still feel abrupt.

## 4. Issues and gaps

### Critical: authenticated users are not authorized against session ownership

Files:
- `backend/src/controllers/interview.controller.ts`
- `backend/src/repositories/message.repository.ts`
- `backend/src/repositories/session.repository.ts`
- `backend/src/repositories/summary.repository.ts`

Findings:
- `start_session` uses `req.user.userId` when creating the session.
- `interview_chat` and `interview_summary` do not use `req.user` at all.
- They trust `sessionId` from the request body and operate on that session directly.
- Repository queries also use `sessionId` only, without `userId`.

Impact:
- Any authenticated user who obtains another valid `sessionId` could potentially read, append to, or summarize another user's interview session.
- This is an authorization flaw, not just a validation issue.

Status:
- Authentication is present.
- Resource ownership enforcement is missing.

### High: backend request validation is minimal to nonexistent

Files:
- `backend/src/controllers/auth.controller.ts`
- `backend/src/services/auth.service.ts`

Findings:
- There is no schema validation for registration or login payloads.
- No backend checks enforce:
  - email format
  - password strength
  - minimum or maximum field lengths
  - trimmed input
  - lowercased email normalization
- Registration directly passes `full_name`, `email`, and `password` into the service.
- Login directly passes `email` and `password` into the service.

Impact:
- Weak or malformed credentials can be accepted.
- Duplicate accounts may occur for email casing variants if the database collation is case-sensitive.
- Inconsistent whitespace handling can create avoidable login failures and dirty user data.

Status:
- Functional.
- Not complete or production-grade.

### High: duplicate-email handling relies on Prisma/database errors

Files:
- `backend/prisma/schema.prisma`
- `backend/src/controllers/auth.controller.ts`

Findings:
- Duplicate protection exists through `@unique` on `User.email`.
- There is no explicit duplicate-email branch in the service/controller.
- The controller returns `err.message` directly on registration failure.

Impact:
- Registration correctness depends on a database exception rather than application-level validation.
- Users may receive raw or low-quality backend error messages.
- Internal implementation details may leak through error text.

Status:
- Duplicate prevention exists.
- Error handling around it is weak.

### Medium: logout endpoint is not authenticated

Files:
- `backend/src/routes/auth.routes.ts`
- `backend/src/controllers/auth.controller.ts`

Findings:
- `POST /api/auth/logout` accepts a refresh token and revokes it without requiring a valid access token.
- The frontend does send the access token when available, but the backend does not verify it.

Impact:
- An attacker with a stolen refresh token could revoke that session without also presenting the access token.
- This does not enable account takeover, but it is looser than the rest of the auth design.

Status:
- Works functionally.
- Authorization is weaker than expected.

### Medium: frontend error wrapping misclassifies backend auth failures as network failures

File:
- `frontend/src/services/auth.api.ts`

Findings:
- `registerUser()` and `loginUser()` throw an error when `res.ok` is false.
- That thrown error is caught by the same `catch` block used for real fetch/network failures.
- The final error message becomes `Network request failed: ...` even for valid server responses such as invalid credentials.

Impact:
- Users can see misleading errors.
- Debugging becomes noisier because auth errors and transport failures are blurred together.

Status:
- API calls work.
- UX and diagnostics are inconsistent.

### Medium: login screen does not handle empty credentials explicitly

File:
- `frontend/app/(auth)/login.tsx`

Findings:
- `handleLogin()` only runs when both `email` and `password` are truthy.
- If either field is empty, nothing happens and no alert is shown.

Impact:
- The login UX is silent and confusing.

Status:
- Basic happy path works.
- Failure/validation UX is incomplete.

### Medium: hardcoded fallback API URL is risky

File:
- `frontend/src/config/api.ts`

Findings:
- The app falls back to a hardcoded ngrok URL if `expoConfig.extra.API_URL` is absent.

Impact:
- Different environments may accidentally point to an unexpected backend.
- Auth bugs can appear if the frontend hits a server using a different secret set or database.
- This is especially brittle for mobile testing and shared development.

Status:
- Convenient for development.
- Fragile and risky for production readiness.

### Low: old/stored user profile can drift from backend truth

Files:
- `frontend/src/redux/slices/auth.ts`
- `frontend/src/storage/authStorage.ts`

Findings:
- Refresh responses return only tokens, not a fresh user payload.
- `bootstrapAuth()` restores the stored `user` object after refresh.

Impact:
- User display data can become stale.
- This is not a direct auth bypass, but it weakens consistency.

Status:
- Acceptable short term.
- Incomplete if user profile mutability matters.

## 5. Security concerns

### Strong points

- Passwords are hashed with bcrypt.
- Password hashes are never returned to the client.
- Access tokens are short-lived.
- Refresh tokens are random, hashed at rest, and rotated.
- Reused/revoked refresh tokens trigger stronger revocation behavior.

### Concerns

- Refresh tokens are stored in `AsyncStorage`, which is not secure storage for sensitive credentials on mobile.
- Interview authorization is incomplete because `sessionId` ownership is never checked for chat and summary operations.
- Backend auth inputs are not validated or normalized server-side.
- Registration error handling may leak backend/internal error messages.
- The hardcoded fallback backend URL increases the chance of accidental cross-environment auth failures.

## 6. UX concerns

- Login with empty fields gives no feedback.
- Registration only checks presence on the client, not quality.
- Auth API error wording can incorrectly say "Network request failed" for normal backend rejections.
- Session-expiry recovery clears auth state, but there is no clear, centralized user message explaining why the user was signed out.
- Google login is shown in the UI as a placeholder even though it is not implemented, which can confuse users about actual auth capabilities.

## 7. Recommended fixes and improvements

### Priority 1: fix authorization on interview resources

- For `chat` and `summary`, verify that the supplied `sessionId` belongs to `req.user.userId` before reading or mutating session data.
- Update repository queries to scope by both `sessionId` and `userId`.
- Return `403 Forbidden` or `404 Not Found` for sessions outside the caller's ownership.

### Priority 2: add backend request validation

- Validate registration and login payloads with a server-side schema.
- Enforce:
  - non-empty values
  - trimmed strings
  - email format
  - lowercased email normalization
  - password minimum strength/length
- Return structured validation errors instead of relying on downstream exceptions.

### Priority 3: improve duplicate-email handling

- Catch Prisma unique-constraint violations explicitly.
- Return a clean `409 Conflict` with a user-safe message like "Email already in use."
- Avoid returning raw `err.message` directly to clients.

### Priority 4: move refresh token storage to secure device storage

- Replace `AsyncStorage` for refresh-token persistence with Expo SecureStore or another platform-secure secret store.
- Keeping access tokens in memory is fine; the main issue is refresh-token persistence.

### Priority 5: clean up auth UX

- Show inline or alert feedback for empty login fields.
- Stop labeling backend credential errors as network failures.
- Add a centralized message when refresh fails or the session expires.
- Remove or hide the Google login CTA until it exists.

### Priority 6: tighten environment handling

- Remove the hardcoded ngrok fallback from `frontend/src/config/api.ts`.
- Require the API base URL from explicit configuration per environment.

### Priority 7: consider tightening logout semantics

- Decide whether `POST /api/auth/logout` should also require a valid access token.
- At minimum, document the intended behavior clearly.

### Priority 8: improve session/user consistency

- Consider a `GET /api/auth/me` endpoint after refresh or app bootstrap.
- That would let the app validate both session freshness and current user state from the server.

## 8. Overall authentication system status

### Overall assessment

The authentication system is no longer incomplete in the basic sense. Core auth is implemented and functional:

- registration works
- login works
- JWT access control exists
- refresh-token rotation exists
- app restart persistence exists
- protected interview routes require authentication

However, it is not yet production-ready.

### Why it is not production-ready yet

- Resource authorization is incomplete for interview session access.
- Sensitive refresh tokens are stored in insecure mobile storage.
- Backend input validation is too weak.
- Duplicate-email and error handling are not robust enough.
- UX around invalid input and expired sessions is still rough.

### Final status

Current state: functional but not production-ready.

Recommended status label: `Partially complete, security-sensitive gaps remain`.
