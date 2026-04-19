# Auth Workflow Report

## Scope

This report reviews the current authentication flow across the mobile frontend and backend API, with special focus on the `"Invalid token"` error that appears when the user opens the app and starts an interview.

Reviewed areas:

- Frontend auth state and persistence
- Frontend protected interview API calls
- Backend JWT creation and verification
- Environment and API URL configuration
- Interview route protection and session ownership handling

## Executive Summary

The auth flow is functional at a basic level, but it is fragile in production-like use.

The most likely reason the app shows `"Invalid token"` when reopened is:

1. The frontend restores any stored token from `AsyncStorage` without checking whether it has expired.
2. The backend issues JWTs with a hard expiration of `1h`.
3. When the user reopens the app later, the UI still treats them as logged in.
4. The first protected call to `/api/interview/start_session` fails in backend JWT verification and returns `401 Invalid token`.

There is also a second high-risk config problem:

1. `frontend/.env` defines `API_URL`.
2. The app code does not actually read `frontend/.env` in `src/config/api.ts`.
3. The app falls back to a hardcoded ngrok URL unless `expo.extra.API_URL` is injected.
4. This makes it easy for the app to talk to an unintended backend instance, which can also produce invalid-token behavior if JWT secrets differ.

## Current Auth Flow

### 1. User login / registration

Frontend:

- [`frontend/app/(auth)/login.tsx`](../app/(auth)/login.tsx) calls `loginUser(...)`.
- [`frontend/app/(auth)/register.tsx`](../app/(auth)/register.tsx) calls `registerUser(...)`.
- Both eventually call `signIn(token, user)` from [`frontend/src/context/AuthContext.tsx`](../src/context/AuthContext.tsx).

Backend:

- [`backend/src/routes/auth.routes.ts`](../../backend/src/routes/auth.routes.ts) exposes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- [`backend/src/services/auth.service.ts`](../../backend/src/services/auth.service.ts) signs JWTs with:
  - payload: `{ userId: user.id }`
  - secret: `JWT_SECRET`
  - expiry: `1h`

### 2. Session persistence on app start

On app startup:

- [`frontend/src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) reads `token` and `user` from `AsyncStorage`.
- If both exist, it restores them into React state.
- No expiry check is performed.
- No `/me` or token validation request is performed.
- No refresh-token flow exists.

Result:

- The app can believe the user is authenticated even when the JWT is already expired or invalid for the current backend instance.

### 3. Route guarding in the app

- [`frontend/app/_layout.tsx`](../app/_layout.tsx) checks only whether `user` exists.
- If `user` exists, it allows navigation to protected app groups.
- It does not require a verified token.
- It does not sign the user out after a backend `401`.

Result:

- Navigation succeeds even when API authorization is already broken.

### 4. Protected interview API requests

- [`frontend/src/redux/api/interview_api.ts`](../src/redux/api/interview_api.ts) loads `token` from `AsyncStorage` in `prepareHeaders`.
- It adds `Authorization: Bearer <token>` to interview requests.
- Protected endpoints currently used:
  - `POST /api/interview/start_session`
  - `POST /api/interview/chat`
  - `POST /api/interview/summary`

### 5. Backend JWT verification

- [`backend/src/middleware/auth.middleware.ts`](../../backend/src/middleware/auth.middleware.ts) reads the `Authorization` header.
- It verifies the token with `jwt.verify(token, JWT_SECRET)`.
- On failure it returns `401 { message: "Invalid token" }`.

### 6. Interview session creation

- [`frontend/app/(interview)/problem-selection.tsx`](../app/(interview)/problem-selection.tsx) calls `startSession(...)`.
- Backend route [`backend/src/routes/interview.routes.ts`](../../backend/src/routes/interview.routes.ts) applies `authenticate`.
- If JWT verification fails, the interview never starts.

## Most Likely Cause Of The Current Bug

### Primary cause: expired token is restored as if still valid

Evidence:

- [`backend/src/config/jwt.ts`](../../backend/src/config/jwt.ts) sets `JWT_EXPIRES_IN = "1h"`.
- [`frontend/src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) restores stored tokens without validation.
- [`frontend/app/_layout.tsx`](../app/_layout.tsx) treats stored user state as authenticated.

Why this matches the symptom:

- The app opens successfully.
- The user is not redirected to login.
- The first protected request fails with `"Invalid token"`.

That is exactly what happens when the token is expired but the app still considers the session active.

### Secondary cause: API URL config is not wired correctly

Evidence:

- [`frontend/.env`](../.env) defines `API_URL=...`
- [`frontend/src/config/api.ts`](../src/config/api.ts) only reads:
  - `Constants.expoConfig?.extra?.API_URL`
  - otherwise a hardcoded ngrok fallback
- [`frontend/app.json`](../app.json) does not define `extra.API_URL`

Impact:

- Updating `frontend/.env` does not change the runtime API URL here.
- The app may silently use the hardcoded ngrok backend.
- If that ngrok URL points to a restarted or different backend instance with a different `JWT_SECRET`, previously stored tokens become invalid.

## Additional Problems Found

### 1. No global handling for `401 Unauthorized`

Current behavior:

- Protected requests fail locally in each screen.
- The app shows an error alert.
- The stale token remains in storage.
- The user can stay stuck in a broken logged-in state.

Recommended behavior:

- Intercept `401` in the base query.
- Clear auth state and `AsyncStorage`.
- Redirect the user back to login with a friendly message like `"Session expired. Please sign in again."`

### 2. Frontend/backend user shape is inconsistent

Evidence:

- [`frontend/src/types/types.ts`](../src/types/types.ts) expects `full_name`.
- Backend returns `fullName` from Prisma in [`backend/src/services/auth.service.ts`](../../backend/src/services/auth.service.ts).

Impact:

- User profile rendering and future auth-dependent UI can break or show missing values.
- This is not the direct token failure, but it is part of the auth contract and should be normalized.

### 3. Backend logs the full auth header

Evidence:

- [`backend/src/middleware/auth.middleware.ts`](../../backend/src/middleware/auth.middleware.ts) logs `AUTH HEADER: ...`

Impact:

- Full bearer tokens should not be printed in logs.
- This is a security and debugging hygiene issue.

### 4. JWT failure reasons are hidden

Current behavior:

- All JWT verification failures return the same `"Invalid token"` response.

Impact:

- You cannot distinguish:
  - expired token
  - malformed token
  - missing secret
  - wrong secret

Recommended behavior:

- Log the verification error safely on the server.
- Return clearer client-safe messages like:
  - `"Token expired"`
  - `"Unauthorized"`

### 5. No session ownership validation in chat/summary logic

Evidence:

- Routes are authenticated, but [`backend/src/controllers/interview.controller.ts`](../../backend/src/controllers/interview.controller.ts) does not verify that `sessionId` belongs to `req.user.userId` for chat/summary.

Impact:

- Any authenticated user with another session ID could potentially access or update that session.
- This is a security issue adjacent to auth and should be fixed.

### 6. Frontend defines a history query but backend route is missing

Evidence:

- [`frontend/src/redux/api/interview_api.ts`](../src/redux/api/interview_api.ts) defines `getHistory`.
- [`backend/src/routes/interview.routes.ts`](../../backend/src/routes/interview.routes.ts) does not expose a matching `GET /history`.

Impact:

- Authenticated UX for user-specific data is incomplete/inconsistent.

## What Should Be Improved

### Priority 1: make session restoration safe

Implement one of these immediately:

- Decode the JWT on app startup and reject it locally if expired.
- Or call a backend `GET /api/auth/me` / `POST /api/auth/validate` before treating the user as authenticated.

Minimum expected behavior:

- If token is expired or invalid, clear storage and redirect to login automatically.

### Priority 2: add refresh-token or re-auth strategy

Current access tokens expire after 1 hour and there is no recovery path.

Recommended options:

- Short-lived access token + refresh token
- Or longer-lived access token if refresh is out of scope for now

If you want the app to feel seamless after reopening, refresh tokens are the better long-term solution.

### Priority 3: fix API URL configuration

Use a single consistent source of truth.

Recommended direction:

- Inject `API_URL` through Expo config (`app.json` / app config)
- Remove the hardcoded ngrok fallback from production code
- Make environment selection explicit per build profile

### Priority 4: centralize unauthorized handling

In `fetchBaseQuery`, if response status is `401`:

- clear `token` and `user`
- sign the user out
- send them to login

This turns a confusing broken state into a clean recovery path.

### Priority 5: strengthen backend auth diagnostics and security

- Stop logging raw bearer tokens
- Distinguish expired tokens from invalid tokens internally
- Ensure `JWT_SECRET` is present at boot and fail fast if missing

### Priority 6: enforce session ownership

For `/chat` and `/summary`:

- load the session by `sessionId`
- verify `session.userId === req.user.userId`
- reject mismatches with `403 Forbidden`

## Suggested Next Steps

### Immediate next fixes

1. Add token validation on app startup.
2. Add global `401` logout handling in the frontend API layer.
3. Fix API URL config so `frontend/.env` or Expo `extra` is actually used.
4. Improve backend JWT error handling and remove auth-header logging.

### After that

1. Add a `GET /api/auth/me` or `POST /api/auth/validate` endpoint.
2. Add refresh-token support.
3. Add session ownership checks for chat and summary.
4. Align frontend `User` typing with backend response shape.

## Conclusion

The app is not failing because auth is completely missing. It is failing because session persistence is optimistic, token expiry is enforced only on the backend, and invalid sessions are not recovered cleanly on the frontend.

If you fix startup token validation and centralized `401` handling first, the current `"Invalid token"` issue should either disappear or become much easier to diagnose. After that, API URL cleanup and refresh-token support will make the auth flow much more reliable.
