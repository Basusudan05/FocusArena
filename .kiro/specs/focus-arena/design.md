# Design Document: FocusArena

## Overview

FocusArena is a React single-page application (SPA) built with Vite and React Router. It is a social study competition platform where users track study sessions, form groups, and compete on leaderboards. The current scope is a frontend-only implementation using mock data — no backend, no real authentication, no database.

The architecture prioritizes:
- Clear component boundaries and reusability
- Centralized mock state management via React Context
- Consistent design system enforced through CSS custom properties
- Straightforward navigation via React Router v6

---

## Architecture

The app follows a standard React SPA architecture:

```
Browser
  └── React SPA (Vite dev server / static build)
        ├── React Router (client-side routing)
        ├── App Context (mock state: current user, sessions, groups)
        ├── Pages (one per route)
        └── Components (shared UI primitives and feature components)
```

**State management**: React Context + `useState`/`useReducer`. No Redux or external state library. Context provides:
- `currentUser` — the active mock user
- `sessions` — study sessions accumulated during the browser session
- `groups` — list of groups (supports adding new groups)
- `leaderboard` — mock leaderboard entries

**Routing**: React Router v6 with `<BrowserRouter>`. Route protection is simulated by checking a `isLoggedIn` flag in context (no real JWT/auth).

**Mock data**: All static data lives in `src/data/mockData.js` and is imported by the context provider at startup.

---

## Components and Interfaces

### Directory Structure

```
src/
  assets/           # Static images/icons
  components/
    layout/
      Navbar.jsx
      Sidebar.jsx
      Layout.jsx       # Wraps authenticated pages with Sidebar/Navbar
    ui/
      Button.jsx
      Card.jsx
      StatCard.jsx
      ProgressBar.jsx
      Badge.jsx
      Modal.jsx
      EmptyState.jsx
      LoadingSpinner.jsx
      Alert.jsx         # Success/error/warning messages
    features/
      GroupCard.jsx
      StudySessionItem.jsx
      LeaderboardTable.jsx
      Timer.jsx
      MiniLeaderboard.jsx
  pages/
    LandingPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    DashboardPage.jsx
    TimerPage.jsx
    GroupsPage.jsx
    GroupDetailPage.jsx
    LeaderboardPage.jsx
    ProfilePage.jsx
  data/
    mockData.js
  context/
    AppContext.jsx
  App.jsx
  main.jsx
  index.css
```

### Key Component Interfaces

**Button**
```js
// Props: variant ('primary' | 'secondary' | 'destructive'), disabled, onClick, children, type
<Button variant="primary" onClick={fn}>Start Studying</Button>
```

**StatCard**
```js
// Props: label (string), value (string|number), icon (optional), color ('green'|'yellow'|'indigo'|'default')
<StatCard label="Study Streak" value="7 days" color="green" />
```

**ProgressBar**
```js
// Props: value (0–100), label (optional), color (optional)
<ProgressBar value={65} label="Today's Goal: 65%" />
```

**Modal**
```js
// Props: isOpen, onClose, title, children
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Group">
```

**LeaderboardTable**
```js
// Props: entries (array), currentUserId (string)
// Entry shape: { rank, userId, username, studyTime, points, streak }
<LeaderboardTable entries={filtered} currentUserId={user.id} />
```

**Timer (feature component)**
```js
// Props: onSessionSave (callback)
// Internal state: elapsed seconds, running/paused, subject
<Timer onSessionSave={(session) => addSession(session)} />
```

**GroupCard**
```js
// Props: group { id, name, memberCount, userRank }, onClick
<GroupCard group={g} onClick={() => navigate(`/groups/${g.id}`)} />
```

---

## Data Models

All data lives in `src/data/mockData.js`.

```js
// User
{
  id: string,
  name: string,
  email: string,
  points: number,
  streak: number,             // consecutive study days
  totalStudyMinutes: number,
  groupIds: string[],
  rank: number                // global leaderboard rank
}

// Group
{
  id: string,
  name: string,
  description: string,
  memberIds: string[],
  totalStudyMinutes: number,
  totalPoints: number,
  createdAt: string           // ISO date string
}

// StudySession
{
  id: string,
  userId: string,
  subject: 'DSA' | 'React' | 'Node.js' | 'PostgreSQL' | 'Other',
  durationMinutes: number,
  date: string                // ISO date string (YYYY-MM-DD)
}

// LeaderboardEntry
{
  rank: number,
  userId: string,
  username: string,
  studyTimeMinutes: number,
  points: number,
  streak: number
}

// AppState (Context)
{
  currentUser: User,
  isLoggedIn: boolean,
  sessions: StudySession[],
  groups: Group[],
  leaderboard: LeaderboardEntry[]
}
```

**Leaderboard filter datasets**: mockData exports four arrays — `leaderboardToday`, `leaderboardWeek`, `leaderboardMonth`, `leaderboardAllTime` — each pre-populated with slightly different mock rankings to simulate filtering.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid sessions are saved

*For any* subject selection and elapsed duration of at least 1 minute, stopping the timer should append exactly one new session to the sessions list whose subject and duration match the inputs.

**Validates: Requirements 7.6**

---

### Property 2: Short sessions are rejected

*For any* elapsed duration strictly less than 1 minute (0–59 seconds), stopping the timer should leave the sessions list unchanged.

**Validates: Requirements 7.7**

---

### Property 3: Create group grows the group list

*For any* non-empty group name and any description string, submitting the create group form should result in the groups list length increasing by exactly one, with the new group present in the list.

**Validates: Requirements 8.5**

---

### Property 4: Empty group name is rejected

*For any* create-group form submission where the name field is empty or contains only whitespace, the groups list should remain unchanged and a validation error should be displayed.

**Validates: Requirements 8.6**

---

### Property 5: Leaderboard filter returns the correct dataset

*For any* selected filter period (Today, This Week, This Month, All Time), the rendered leaderboard rows should exactly match the corresponding mock dataset for that period, with row count equal to the dataset's length.

**Validates: Requirements 10.3**

---

### Property 6: Profile edit persists valid changes

*For any* non-empty name string and valid email string, saving the edit profile form should immediately update the displayed name and email to match the submitted values.

**Validates: Requirements 11.5**

---

### Property 7: Profile edit rejects invalid input

*For any* profile save attempt where the name is empty/whitespace OR the email is not a valid email format, the currently displayed profile values should remain unchanged and a validation error should be shown.

**Validates: Requirements 11.6**

---

### Property 8: Blank required fields are rejected in all auth forms

*For any* auth form (login or register) where at least one required field is empty or whitespace-only, submitting the form should neither navigate away nor mutate auth state, and at least one inline validation error should be displayed.

**Validates: Requirements 5.3, 5.5**

---

### Property 9: Password validation rules are enforced

*For any* password string of length < 8, or any pair of password and confirm-password strings that are not equal, the register form should be rejected and the appropriate error message displayed without navigating away.

**Validates: Requirements 5.7, 5.8**

---

### Property 10: Email format validation rejects malformed strings

*For any* string that does not conform to the pattern `local@domain.tld`, the email validation function should return an error and the form should not be submitted.

**Validates: Requirements 5.6**

---

### Property 11: MockData shape invariant

*For any* record in the mock users, groups, sessions, or leaderboard arrays, all required fields defined in the data model should be present and non-null.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

---

### Property 12: Leaderboard entries display all required columns

*For any* rendered leaderboard entry, the output should contain the rank, username, study time, points, and streak values from that entry's data.

**Validates: Requirements 10.1**

---

### Property 13: Members list displays all required fields per member

*For any* member rendered in a Group Details members list, the output should contain that member's study time, points, and streak.

**Validates: Requirements 9.2**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Navigating to unknown route | Redirect to `/` |
| Navigating to `/groups/:id` with unknown ID | Show inline error message on Group Details page |
| Timer stopped < 1 minute | Show warning, do not save session |
| Form submitted with invalid data | Show inline field-level error, prevent submission/navigation |
| Profile saved with invalid data | Show inline error, keep existing values |
| Empty list/table | Show `<EmptyState>` component with descriptive message |

All errors use the red color token. Successes use green. Warnings use yellow. These states are displayed via the `<Alert>` component.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are used. They are complementary:
- **Unit tests** verify specific examples, edge cases, and integration points
- **Property tests** verify universal rules across many randomly generated inputs

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) — the standard property-based testing library for JavaScript/TypeScript.

**Configuration**: Each property test runs a minimum of 100 iterations.

**Tag format per test**:
```
// Feature: focus-arena, Property N: <property text>
```

Each correctness property above maps to exactly one property-based test.

### Unit Testing

**Framework**: Vitest (included in Vite ecosystem, zero config).

Unit tests cover:
- Validation functions (email format, password length, password match, empty fields)
- Timer state transitions (start → pause → reset, elapsed time calculation)
- Session save/reject logic (≥1 min threshold)
- MockData shape verification (required fields present on each record)
- Route rendering (each route renders without crashing)

### Test File Organization

```
src/
  __tests__/
    validation.test.js        # Auth and form validation unit tests (email, password, empty fields)
    timer.test.js             # Timer logic unit tests (state transitions, elapsed time)
    session.test.js           # Session save/reject logic (>= 1 min threshold)
    mockData.test.js          # Mock data presence checks (array lengths, required keys)
    routing.test.js           # Route rendering smoke tests
  __properties__/
    session.property.js       # Properties 1, 2
    groups.property.js        # Properties 3, 4
    leaderboard.property.js   # Properties 5, 12
    profile.property.js       # Properties 6, 7
    forms.property.js         # Properties 8, 9, 10
    mockData.property.js      # Property 11
    groupDetail.property.js   # Property 13
```
