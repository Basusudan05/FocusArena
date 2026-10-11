# Implementation Plan: FocusArena

## Overview

Build the FocusArena React frontend incrementally — starting with project scaffolding and mock data, then working through each page in dependency order, with property-based and unit tests alongside each feature.

## Tasks

- [x] 1. Scaffold project and configure routing
  - Initialize Vite + React (JavaScript) project
  - Install react-router-dom
  - Create folder structure: `src/components/layout`, `src/components/ui`, `src/components/features`, `src/pages`, `src/data`, `src/context`, `src/assets`
  - Configure `main.jsx` with `<BrowserRouter>` and `<App />`
  - Define all 9 routes in `App.jsx` with placeholder page components
  - Add a catch-all route that redirects to `/`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create mock data and app context
  - [x] 2.1 Create `src/data/mockData.js` with all required exports
    - Export `mockUsers` (≥5 users), `mockGroups` (≥3 groups), `mockSessions` (≥10 sessions)
    - Export `leaderboardToday`, `leaderboardWeek`, `leaderboardMonth`, `leaderboardAllTime`
    - Each record must include all fields defined in the data models section of the design
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 Write property test for MockData shape invariant
    - **Property 11: MockData shape invariant**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
    - File: `src/__properties__/mockData.property.js`

  - [x] 2.3 Create `src/context/AppContext.jsx`
    - Provide `currentUser`, `isLoggedIn`, `sessions`, `groups`, `leaderboard` via context
    - Expose `addSession`, `addGroup`, `updateUser` actions
    - Seed initial state from `mockData.js`
    - Wrap `App.jsx` with the provider
    - _Requirements: 2.1_

- [x] 3. Build design system and global styles
  - Write `src/index.css` with CSS custom properties for all color tokens (indigo/purple primary, green, yellow, red, gray neutrals)
  - Define typography scale, spacing scale, border-radius, box-shadow tokens
  - Create `src/components/ui/Button.jsx` with `primary`, `secondary`, `destructive` variants and hover/disabled states
  - Create `src/components/ui/Card.jsx`, `StatCard.jsx`, `ProgressBar.jsx`, `Badge.jsx`
  - Create `src/components/ui/Modal.jsx`, `Alert.jsx`, `EmptyState.jsx`, `LoadingSpinner.jsx`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Build layout components and navigation
  - Create `src/components/layout/Sidebar.jsx` with links to all authenticated routes (visible ≥1024px)
  - Create `src/components/layout/Navbar.jsx` with links to all authenticated routes (visible <768px)
  - Create `src/components/layout/Layout.jsx` that wraps authenticated pages with Sidebar (desktop) or Navbar (mobile)
  - Apply `Layout` to all authenticated routes (`/dashboard`, `/timer`, `/groups`, `/groups/:id`, `/leaderboard`, `/profile`)
  - Do not apply `Layout` to `/`, `/login`, `/register`
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 5. Implement form validation utilities
  - [x] 5.1 Create `src/utils/validation.js` with exported functions:
    - `validateEmail(value)` — returns error string or null
    - `validatePassword(value)` — returns error string or null if < 8 chars
    - `validatePasswordMatch(a, b)` — returns error string or null
    - `validateRequired(value, fieldName)` — returns error string or null
    - _Requirements: 5.3, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 5.2 Write unit tests for validation functions
    - Test `validateEmail` with valid and invalid email strings
    - Test `validatePassword` at boundary (7 chars, 8 chars)
    - Test `validatePasswordMatch` with matching and non-matching pairs
    - Test `validateRequired` with empty string, whitespace, valid value
    - File: `src/__tests__/validation.test.js`

  - [ ]* 5.3 Write property tests for form validation
    - **Property 8: Blank required fields rejected in all auth forms**
    - **Property 9: Password validation rules enforced**
    - **Property 10: Email format validation rejects malformed strings**
    - **Validates: Requirements 5.3, 5.5, 5.6, 5.7, 5.8**
    - File: `src/__properties__/forms.property.js`

- [x] 6. Checkpoint — ensure project builds and context loads
  - Ensure `npm run dev` starts without errors (check console)
  - Ensure all 9 routes render their placeholder components
  - Ensure `npm test -- --run` passes all tests written so far

- [x] 7. Build authentication pages
  - [x] 7.1 Build `src/pages/LoginPage.jsx`
    - Email and password fields using validation utils
    - On valid submit: set `isLoggedIn = true` in context, navigate to `/dashboard`
    - Display inline field errors on invalid submit
    - Link to `/register`
    - _Requirements: 5.1, 5.2, 5.3, 5.9_

  - [x] 7.2 Build `src/pages/RegisterPage.jsx`
    - Name, email, password, confirm password fields using validation utils
    - Display inline errors for each field on invalid submit
    - Link to `/login`
    - On valid submit: navigate to `/login`
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8, 5.10_

- [x] 8. Build landing page
  - Build `src/pages/LandingPage.jsx` with:
    - Hero section (headline, subheadline, "Get Started" → `/register`, "Login" → `/login`)
    - "How It Works" section with sequential steps
    - Dashboard preview/mockup section (static image or styled mock)
    - Features section
    - Call-to-action section
    - Footer
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 9. Build dashboard page
  - Build `src/pages/DashboardPage.jsx` consuming `AppContext`
  - Greeting with current user's name
  - StatCards: today's study time, points, streak, leaderboard rank
  - Today's goal ProgressBar
  - "Start Studying" button → `/timer`
  - Current group summary
  - Recent sessions list using `StudySessionItem` component
  - Mini leaderboard using `MiniLeaderboard` component
  - Create `src/components/features/StudySessionItem.jsx` and `MiniLeaderboard.jsx`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [x] 10. Build study timer page
  - [x] 10.1 Extract timer logic into `src/hooks/useTimer.js`
    - State: `elapsedSeconds`, `isRunning`, `subject`
    - Actions: `start()`, `pause()`, `reset()`, `setSubject(subject)`
    - Returns session object on stop: `{ subject, durationMinutes, date }`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 10.2 Write unit tests for timer hook logic
    - Test start/pause/reset transitions
    - Test elapsed time calculation
    - File: `src/__tests__/timer.test.js`

  - [x] 10.3 Build `src/pages/TimerPage.jsx`
    - Display HH:MM:SS timer using `useTimer`
    - Subject selector (DSA, React, Node.js, PostgreSQL, Other)
    - Start/Pause/Reset buttons
    - Today's total study time from context
    - On stop: validate duration ≥ 1 min, call `addSession`, show success/warning Alert
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 10.4 Write property tests for session save/reject logic
    - **Property 1: Valid sessions are saved**
    - **Property 2: Short sessions are rejected**
    - **Validates: Requirements 7.6, 7.7**
    - File: `src/__properties__/session.property.js`

- [x] 11. Checkpoint — timer and auth working
  - Verify login navigates to dashboard, register validates and navigates to login
  - Verify timer counts up, saves sessions ≥ 1 min, rejects sessions < 1 min
  - Ensure all tests pass

- [x] 12. Build groups page
  - [x] 12.1 Create `src/components/features/GroupCard.jsx`
    - Displays group name, member count, user's rank in the group
    - Navigates to `/groups/:id` on click
    - _Requirements: 8.1, 8.2, 8.8_

  - [x] 12.2 Build `src/pages/GroupsPage.jsx`
    - Grid of GroupCards from context
    - "Create Group" button → opens Modal with name + description fields
    - On valid submit: call `addGroup`, close modal, new card appears
    - Validate non-empty group name, show inline error if empty
    - "Join Group" placeholder button
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 12.3 Write property tests for group creation
    - **Property 3: Create group grows the group list**
    - **Property 4: Empty group name is rejected**
    - **Validates: Requirements 8.5, 8.6**
    - File: `src/__properties__/groups.property.js`

- [x] 13. Build group details page
  - Build `src/pages/GroupDetailPage.jsx`
  - Read group by `id` param from context; show error message if not found
  - Display group name, total members, aggregate study time, total points
  - Members table with study time, points, streak per member
  - Highlight current user's row with a distinct style
  - Create `src/components/features/LeaderboardTable.jsx` (shared with leaderboard page)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 13.1 Write property test for members list fields
    - **Property 13: Members list displays all required fields per member**
    - **Validates: Requirements 9.2**
    - File: `src/__properties__/groupDetail.property.js`

- [x] 14. Build leaderboard page
  - [x] 14.1 Build `src/pages/LeaderboardPage.jsx`
    - Reuse `LeaderboardTable` component
    - Period filter buttons: Today, This Week, This Month, All Time
    - On filter click: swap displayed dataset from mockData
    - Highlight current user's row
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 14.2 Write property tests for leaderboard
    - **Property 5: Leaderboard filter returns the correct dataset**
    - **Property 12: Leaderboard entries display all required columns**
    - **Validates: Requirements 10.1, 10.3**
    - File: `src/__properties__/leaderboard.property.js`

- [x] 15. Build profile page
  - [x] 15.1 Build `src/pages/ProfilePage.jsx`
    - Display current user name and email
    - StatCards for total study time, points, streak, groups joined
    - Recent study activity list
    - "Edit Profile" form (name + email fields, Save button)
    - On valid save: call `updateUser` in context, reflect updated values immediately
    - On invalid save: show inline validation errors using validation utils
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 15.2 Write property tests for profile edit
    - **Property 6: Profile edit persists valid changes**
    - **Property 7: Profile edit rejects invalid input**
    - **Validates: Requirements 11.5, 11.6**
    - File: `src/__properties__/profile.property.js`

- [x] 16. Add loading, empty, error, and success states throughout
  - Add `LoadingSpinner` to any list that simulates async loading (use a brief `setTimeout` delay)
  - Add `EmptyState` to sessions list, groups grid, leaderboard table when data arrays are empty
  - Verify `Alert` component is used for all success and error feedback (timer save, group create, profile edit)
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 17. Make all pages fully responsive
  - Apply responsive CSS for dashboard sidebar/navbar swap at 1024px / 768px breakpoints
  - Ensure group cards stack vertically on mobile
  - Ensure leaderboard table has horizontal scroll on mobile
  - Test all pages at 1280px, 768px, and 375px viewport widths
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 18. Final checkpoint — full application review
  - Ensure all 9 routes render without console errors
  - Ensure all form validations work correctly on each page
  - Ensure timer, group creation, and profile edit update state and reflect changes
  - Ensure `npm test -- --run` passes all tests
  - Fix any broken imports, layout issues, or console errors

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with minimum 100 iterations per property
- Unit tests use Vitest (built into the Vite ecosystem, no extra config)
- Checkpoints (tasks 6, 11, 18) ensure incremental validation at key milestones
