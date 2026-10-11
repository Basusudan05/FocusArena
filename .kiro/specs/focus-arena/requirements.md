# Requirements Document

## Introduction

FocusArena is a social study platform where friends can study together and compete based on how much they actually study. The platform gamifies studying through groups, leaderboards, streaks, and points — turning consistent effort into friendly competition. This document covers the React frontend built with Vite, React Router, and JavaScript using mock data (no backend or real authentication at this stage).

## Glossary

- **App**: The FocusArena React frontend application
- **User**: A mock authenticated user interacting with the App
- **Session**: A single timed study period tracked by the Timer
- **Group**: A collection of Users who study together and compete
- **Leaderboard**: A ranked list of Users or Group members sorted by study performance
- **Streak**: The number of consecutive days a User has completed at least one Session
- **Points**: A numeric score accumulated by a User based on study activity
- **MockData**: Static JavaScript data used in place of a real backend
- **Router**: React Router managing client-side navigation between pages
- **Navbar**: The top navigation bar shown on authenticated pages
- **Sidebar**: The left navigation panel shown on desktop authenticated pages
- **Timer**: The study countdown/count-up component on the timer page
- **StatCard**: A UI component displaying a single metric (time, points, streak, rank)

---

## Requirements

### Requirement 1: Project Setup and Routing

**User Story:** As a developer, I want a properly scaffolded Vite + React project with all routes configured, so that I can build and navigate the full application.

#### Acceptance Criteria

1. THE App SHALL be scaffolded using Vite with the React JavaScript template
2. THE App SHALL use React Router for all client-side navigation
3. THE App SHALL define routes for `/`, `/login`, `/register`, `/dashboard`, `/timer`, `/groups`, `/groups/:id`, `/leaderboard`, and `/profile`
4. WHEN a User navigates to an undefined route, THE App SHALL redirect to the landing page
5. THE App SHALL organize source files under `src/components`, `src/pages`, `src/data`, and `src/assets`

---

### Requirement 2: Mock Data

**User Story:** As a developer, I want a centralized mock data file, so that all pages can share consistent, realistic test data without a backend.

#### Acceptance Criteria

1. THE App SHALL provide a `mockData.js` file exporting mock users, groups, study sessions, leaderboard entries, and statistics
2. THE MockData SHALL include at least 5 mock users with name, email, points, streak, and total study time
3. THE MockData SHALL include at least 3 mock groups, each with a name, description, member list, and aggregate statistics
4. THE MockData SHALL include at least 10 mock study sessions, each with a subject, duration in minutes, and date
5. THE MockData SHALL include a leaderboard array with rank, username, study time, points, and streak per entry

---

### Requirement 3: Design System and Global Styles

**User Story:** As a user, I want a clean, consistent visual experience, so that the app looks professional and is easy to read.

#### Acceptance Criteria

1. THE App SHALL apply a light neutral background with indigo/purple as the primary accent color
2. THE App SHALL use green to indicate positive progress, yellow for points and achievements, and red exclusively for errors
3. THE App SHALL define reusable button variants: primary, secondary, and destructive, each with hover and disabled states
4. THE App SHALL define consistent input styles with visible focus states
5. THE App SHALL use rounded corners and subtle shadows on all Card components
6. THE App SHALL apply a consistent font and typographic hierarchy across all pages
7. THE App SHALL NOT use excessive gradients, animations, or childish gamification visuals

---

### Requirement 4: Landing Page

**User Story:** As a visitor, I want to understand what FocusArena does and be encouraged to sign up, so that I can decide to join the platform.

#### Acceptance Criteria

1. THE App SHALL display a hero section with a headline, subheadline, a "Get Started" button, and a "Login" button
2. THE App SHALL display a "How It Works" section explaining the platform in sequential steps
3. THE App SHALL display a dashboard preview or mockup section showing what the product looks like
4. THE App SHALL display a features section listing key platform capabilities
5. THE App SHALL display a final call-to-action section prompting visitors to sign up
6. THE App SHALL display a footer with basic site information
7. WHEN a visitor clicks "Get Started", THE App SHALL navigate to the `/register` route
8. WHEN a visitor clicks "Login", THE App SHALL navigate to the `/login` route

---

### Requirement 5: Authentication Pages

**User Story:** As a visitor, I want to log in or register, so that I can access the platform's features.

#### Acceptance Criteria

1. THE Login_Page SHALL display email and password fields with a submit button
2. WHEN a User submits the login form with valid mock credentials, THE App SHALL navigate to `/dashboard`
3. IF a User submits the login form with an empty field, THEN THE Login_Page SHALL display an inline validation error
4. THE Register_Page SHALL display fields for name, email, password, and confirm password
5. IF a User submits the register form with an empty required field, THEN THE Register_Page SHALL display an inline validation error for that field
6. IF a User submits the register form with an invalid email format, THEN THE Register_Page SHALL display an email format error
7. IF a User submits the register form with a password shorter than 8 characters, THEN THE Register_Page SHALL display a password length error
8. IF a User submits the register form with mismatched passwords, THEN THE Register_Page SHALL display a password mismatch error
9. THE Login_Page SHALL provide a navigation link to the Register page
10. THE Register_Page SHALL provide a navigation link to the Login page

---

### Requirement 6: Dashboard Page

**User Story:** As a User, I want a dashboard showing my study performance at a glance, so that I can track my progress and stay motivated.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL display a greeting with the current mock User's name
2. THE Dashboard_Page SHALL display StatCards for today's total study time, current points, study streak, and leaderboard rank
3. THE Dashboard_Page SHALL display a today's study goal with a ProgressBar showing percentage completion
4. THE Dashboard_Page SHALL display a "Start Studying" button that navigates to `/timer`
5. THE Dashboard_Page SHALL display the current User's active Group name and summary
6. THE Dashboard_Page SHALL display a list of recent study sessions
7. THE Dashboard_Page SHALL display a mini leaderboard showing top-ranked users
8. WHILE on desktop, THE Dashboard_Page SHALL display a Sidebar for navigation
9. WHILE on mobile, THE Dashboard_Page SHALL display a Navbar or bottom navigation in place of the Sidebar

---

### Requirement 7: Study Timer Page

**User Story:** As a User, I want to time my study sessions and log them, so that my effort is tracked and counted toward my score.

#### Acceptance Criteria

1. THE Timer_Page SHALL display a large, readable timer counting upward in HH:MM:SS format
2. THE Timer_Page SHALL provide Start, Pause, and Reset controls
3. THE Timer_Page SHALL allow the User to select a subject from: DSA, React, Node.js, PostgreSQL, Other
4. THE Timer_Page SHALL display the currently active subject while a session is running
5. THE Timer_Page SHALL display the User's total study time for today
6. WHEN the User stops a session of at least 1 minute, THE Timer_Page SHALL save the session to frontend state
7. IF the User attempts to stop a session shorter than 1 minute, THEN THE Timer_Page SHALL display a warning and not save the session
8. WHEN a session is saved, THE Timer_Page SHALL display a success confirmation message

---

### Requirement 8: Groups Page

**User Story:** As a User, I want to view, create, and join study groups, so that I can compete with friends.

#### Acceptance Criteria

1. THE Groups_Page SHALL display a grid of the User's current groups as GroupCards
2. EACH GroupCard SHALL display the group name, member count, and the User's rank within the group
3. THE Groups_Page SHALL display a "Create Group" button
4. WHEN the User clicks "Create Group", THE Groups_Page SHALL display a modal with name and description fields
5. WHEN the User submits a valid new group form, THE Groups_Page SHALL add the new group to the displayed list using frontend state
6. IF the User submits the create group form with an empty name, THEN THE Groups_Page SHALL display a validation error
7. THE Groups_Page SHALL display a "Join Group" button or UI element
8. WHEN a User navigates to a GroupCard, THE App SHALL navigate to `/groups/:id`

---

### Requirement 9: Group Details Page

**User Story:** As a User, I want to see the details of a study group, so that I can compare my performance with other members.

#### Acceptance Criteria

1. THE Group_Details_Page SHALL display the group name, total member count, aggregate study time, and total points
2. THE Group_Details_Page SHALL display a members list with each member's study time, points, and streak
3. THE Group_Details_Page SHALL visually highlight the current User's row in the members list
4. WHEN a User navigates to `/groups/:id` for a non-existent group, THE App SHALL display an error message

---

### Requirement 10: Leaderboard Page

**User Story:** As a User, I want to see how I rank against others, so that I can stay motivated to study more.

#### Acceptance Criteria

1. THE Leaderboard_Page SHALL display a ranked table with columns for rank, username, study time, points, and streak
2. THE Leaderboard_Page SHALL provide filter options: Today, This Week, This Month, All Time
3. WHEN a User selects a filter, THE Leaderboard_Page SHALL update the displayed data using the corresponding mock dataset
4. THE Leaderboard_Page SHALL visually highlight the current User's row in the table

---

### Requirement 11: Profile Page

**User Story:** As a User, I want to view and edit my profile, so that I can manage my account information and see my stats.

#### Acceptance Criteria

1. THE Profile_Page SHALL display the User's name and email
2. THE Profile_Page SHALL display StatCards for total study time, total points, current streak, and groups joined
3. THE Profile_Page SHALL display a list of recent study activity
4. THE Profile_Page SHALL display an "Edit Profile" interface allowing the User to update name and email in frontend state
5. WHEN the User saves a valid profile edit, THE Profile_Page SHALL reflect the updated name and email immediately
6. IF the User saves a profile edit with an empty name or invalid email, THEN THE Profile_Page SHALL display a validation error

---

### Requirement 12: Navigation and Layout

**User Story:** As a User, I want consistent navigation across all authenticated pages, so that I can move between features easily.

#### Acceptance Criteria

1. THE App SHALL display a Navbar or Sidebar on all authenticated pages (`/dashboard`, `/timer`, `/groups`, `/groups/:id`, `/leaderboard`, `/profile`)
2. WHILE on desktop (viewport ≥ 1024px), THE App SHALL display a Sidebar with links to all authenticated routes
3. WHILE on mobile (viewport < 768px), THE App SHALL display a Navbar or bottom navigation with links to all authenticated routes
4. THE App SHALL NOT display the Sidebar or authenticated Navbar on the landing, login, or register pages

---

### Requirement 13: Responsive Design

**User Story:** As a User on any device, I want the app to be usable on desktop, tablet, and mobile, so that I can study from any device.

#### Acceptance Criteria

1. THE App SHALL be responsive across desktop (≥ 1024px), tablet (768px–1023px), and mobile (< 768px) viewports
2. WHILE on mobile, THE App SHALL stack Card components vertically
3. WHILE on mobile, THE App SHALL make tables readable via horizontal scrolling or a responsive card layout
4. THE App SHALL NOT show layout overflow or broken components at any of the defined viewport sizes

---

### Requirement 14: UI States

**User Story:** As a User, I want the app to give clear feedback during loading, errors, and empty states, so that I always know what's happening.

#### Acceptance Criteria

1. THE App SHALL display a loading indicator when data is being fetched or a simulated async operation is in progress
2. IF no data is available for a list or table, THEN THE App SHALL display an empty state message
3. IF an operation fails, THEN THE App SHALL display an error message describing what went wrong
4. WHEN an operation succeeds, THE App SHALL display a success confirmation message
