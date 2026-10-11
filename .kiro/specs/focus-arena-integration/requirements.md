# Requirements Document

## Introduction

This document covers the final integration phase of the FocusArena platform. The React frontend (Vite), Node.js/Express backend, and Supabase database are all built. This phase verifies that all three layers work together correctly: authentication flows end-to-end, study sessions persist and affect scores, group membership is enforced, leaderboards reflect real data, and the existing test suites remain green. Implementation means fixing bugs and wiring gaps — not rebuilding working features.

## Glossary

- **App**: The FocusArena React/Vite frontend application
- **Backend**: The Node.js/Express API server in `backend/`
- **Supabase**: The hosted PostgreSQL + auth service used for persistence and JWT-based auth
- **JWT**: JSON Web Token issued by Supabase Auth and forwarded in `Authorization: Bearer` headers
- **Profile**: A row in the `profiles` Supabase table linked 1:1 to a Supabase auth user
- **Session**: A row in the `study_sessions` table representing one completed study period
- **Group**: A row in the `groups` table; members are tracked in `group_members`
- **Points**: An integer stored on each `study_sessions` row; 1 point per study minute
- **Leaderboard**: A ranked list derived by aggregating `points` from `study_sessions`
- **ProtectedRoute**: A React component that redirects unauthenticated users to `/login`
- **PublicOnlyRoute**: A React component that redirects already-authenticated users to `/dashboard`
- **Auth_Middleware**: The Express `auth.js` middleware that validates JWTs on every protected route
- **RLS**: Row Level Security — Supabase Postgres policies controlling which rows each user can read/write

---

## Requirements

### Requirement 1: Authentication Flow

**User Story:** As a user, I want to register, log in, and log out reliably, so that my data is always associated with my account and protected from other users.

#### Acceptance Criteria

1. WHEN a user submits valid registration credentials, THE App SHALL call `supabase.auth.signUp`, upsert a profile row via `PUT /api/profiles/:id`, and navigate to `/login`
2. WHEN a user submits valid login credentials, THE App SHALL call `supabase.auth.signInWithPassword`, store the session, and navigate to `/dashboard`
3. WHEN a user clicks logout, THE App SHALL call `supabase.auth.signOut`, clear all local state, and redirect to `/login`
4. WHEN an unauthenticated request reaches any protected Backend route, THE Backend SHALL return HTTP 401
5. WHEN a valid JWT is present in the Authorization header, THE Auth_Middleware SHALL attach `req.user.id` and call `next()`
6. IF a user navigates to a protected route while unauthenticated, THEN THE ProtectedRoute SHALL redirect to `/login`
7. IF a logged-in user navigates to `/login` or `/register`, THEN THE PublicOnlyRoute SHALL redirect to `/dashboard`
8. WHEN a user refreshes the page while logged in, THE App SHALL restore the authenticated session without requiring re-login

---

### Requirement 2: Profile Persistence

**User Story:** As a user, I want my profile data to be stored in the database, so that my name and email survive page refreshes and re-logins.

#### Acceptance Criteria

1. THE Backend SHALL expose `GET /api/profiles/:id` returning only the requesting user's own profile row, or HTTP 403 for any other user ID
2. THE Backend SHALL expose `PUT /api/profiles/:id` accepting `full_name`, `username`, `avatar_url`, and `email` fields, stripping any other keys, and performing an upsert
3. WHEN a profile update is saved, THE App SHALL call `PUT /api/profiles/:id` and reflect the updated values immediately in the UI
4. IF a request to `PUT /api/profiles/:id` contains no valid fields, THEN THE Backend SHALL return HTTP 400
5. IF a request to `GET /api/profiles/:id` is made for a non-existent user, THEN THE Backend SHALL return HTTP 404

---

### Requirement 3: Study Session Flow

**User Story:** As a user, I want completed study sessions to be saved to the database and reflected in my stats immediately, so that my points and history are accurate.

#### Acceptance Criteria

1. WHEN the user saves a session of at least 1 minute, THE App SHALL call `POST /api/study-sessions` with `duration_minutes` and optional `group_id`
2. THE Backend SHALL validate that `duration_minutes` is an integer greater than or equal to 1, returning HTTP 400 otherwise
3. THE Backend SHALL calculate `points` as `duration_minutes` multiplied by 1 and store it on the session row
4. THE Backend SHALL set `user_id` from `req.user.id`, ignoring any `user_id` in the request body
5. WHEN a session is saved, THE App SHALL prepend the returned record to the local sessions list and refresh dependent UI
6. IF `group_id` is provided and is not a valid UUID, THEN THE Backend SHALL return HTTP 400
7. IF `group_id` is provided and the user is not a member of that group, THEN THE Backend SHALL return HTTP 403
8. WHEN a session shorter than 1 minute is attempted, THE Timer_Page SHALL display a warning and not call the API

---

### Requirement 4: Groups and Membership

**User Story:** As a user, I want to create groups, join existing groups, and see group leaderboards, so that I can compete with friends.

#### Acceptance Criteria

1. WHEN a user creates a group with a non-empty name, THE Backend SHALL insert a groups row and a group_members row for the creator, returning HTTP 201
2. IF the group name is empty or whitespace, THEN THE Backend SHALL return HTTP 400
3. WHEN a user joins an existing group, THE Backend SHALL insert a group_members row and return HTTP 200
4. IF a user attempts to join a group they are already a member of, THEN THE Backend SHALL return HTTP 409
5. WHEN a user leaves a group, THE Backend SHALL delete their group_members row and the App SHALL navigate to `/groups`
6. THE `GET /api/groups` endpoint SHALL return only the groups that the requesting user is a member of
7. THE `GET /api/groups/:id` endpoint SHALL return the group row plus a members array containing profile info for each member
8. WHEN navigating to a non-existent group, THE App SHALL display an error message instead of crashing

---

### Requirement 5: Leaderboard Accuracy

**User Story:** As a user, I want leaderboards to display real, database-backed rankings so that competition is fair and accurate.

#### Acceptance Criteria

1. THE `GET /api/leaderboard` endpoint SHALL accept a `period` query parameter with values `today`, `week`, `month`, or `allTime`
2. IF an invalid period value is provided, THEN THE Backend SHALL return HTTP 400
3. WHEN `period=today` is requested, THE Backend SHALL only aggregate sessions with `started_at` on the current calendar day
4. WHEN `period=allTime` is requested or no period is provided, THE Backend SHALL aggregate all sessions without a date filter
5. THE Leaderboard_Page SHALL display real data from the API and refresh after the user saves a new session
6. THE `GET /api/groups/:id/leaderboard` endpoint SHALL return members ranked by total points from sessions scoped to that group
7. IF the requesting user is not a member of the group, THEN THE Backend SHALL return HTTP 403 for the group leaderboard endpoint

---

### Requirement 6: Data Integrity and Authorization

**User Story:** As a user, I want to be certain that I cannot read or modify another user's private data, so that the platform is trustworthy.

#### Acceptance Criteria

1. THE Backend SHALL reject all requests to protected endpoints without a valid Bearer token with HTTP 401
2. A user SHALL NOT be able to read another user's profile via `GET /api/profiles/:id`
3. A user SHALL NOT be able to update another user's profile via `PUT /api/profiles/:id`
4. THE Backend SHALL only return study sessions belonging to the authenticated user from `GET /api/study-sessions`
5. THE `group_id` on a session SHALL only be accepted if the authenticated user is a member of that group
6. THE Supabase service-role key SHALL only exist in the backend environment and SHALL NOT be present in the frontend bundle

---

### Requirement 7: Frontend Data Consistency

**User Story:** As a user, I want all pages to show data that comes from the real database, so that what I see is always accurate after refreshes or re-logins.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL derive study stats from the real sessions array loaded from the API
2. THE Groups_Page SHALL fetch groups from the API and not depend on mock data
3. THE Leaderboard_Page SHALL fetch rankings from the API and not use mock leaderboard arrays
4. THE Profile_Page SHALL display stats derived from real sessions and show profile data from the API
5. WHEN the user logs out and back in, THE App SHALL re-fetch fresh data from the API and display it correctly
6. WHEN the App encounters a network or API error, THE App SHALL display a descriptive error message and not crash

---

### Requirement 8: Error Handling and HTTP Status Codes

**User Story:** As a developer, I want the API to return appropriate HTTP status codes and the frontend to display helpful error messages, so that problems are easy to diagnose.

#### Acceptance Criteria

1. WHEN a resource is not found, THE Backend SHALL return HTTP 404 with a JSON error body
2. WHEN input validation fails, THE Backend SHALL return HTTP 400 with a JSON error body
3. WHEN the caller lacks permission, THE Backend SHALL return HTTP 403 with a JSON error body
4. WHEN a duplicate submission is made, THE Backend SHALL return HTTP 409 with a JSON error body
5. WHEN a database operation fails, THE Backend SHALL return HTTP 500 and log the error server-side
6. IF the App receives a non-OK HTTP response, THEN THE App SHALL display the error field from the response body as a user-facing message

---

### Requirement 9: Test Suite Integrity

**User Story:** As a developer, I want all existing tests to pass and focused integration tests to be added, so that regressions are caught automatically.

#### Acceptance Criteria

1. THE backend test suite SHALL pass with 0 failures after all fixes are applied
2. THE frontend test suite SHALL pass with 0 failures after all fixes are applied
3. WHEN the `POST /api/study-sessions` controller receives a request with a `user_id` in the body, THE Backend SHALL ignore it and use `req.user.id` instead
4. WHEN new backend tests are added for gaps in coverage, THE tests SHALL use stubbed Supabase clients and not make real network calls
