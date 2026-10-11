// ─────────────────────────────────────────────────────────────────────────────
// FocusArena Mock Data
// All static data used by the app in place of a real backend.
// ─────────────────────────────────────────────────────────────────────────────

// ── Users ────────────────────────────────────────────────────────────────────
// Shape: { id, name, email, points, streak, totalStudyMinutes, groupIds, rank }

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@focusarena.dev',
    points: 3840,
    streak: 14,
    totalStudyMinutes: 1920,
    groupIds: ['group-1', 'group-2'],
    rank: 1,
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria@focusarena.dev',
    points: 3210,
    streak: 10,
    totalStudyMinutes: 1605,
    groupIds: ['group-1', 'group-3'],
    rank: 2,
  },
  {
    id: 'user-3',
    name: 'James Lee',
    email: 'james@focusarena.dev',
    points: 2750,
    streak: 7,
    totalStudyMinutes: 1375,
    groupIds: ['group-2'],
    rank: 3,
  },
  {
    id: 'user-4',
    name: 'Priya Patel',
    email: 'priya@focusarena.dev',
    points: 2100,
    streak: 5,
    totalStudyMinutes: 1050,
    groupIds: ['group-1', 'group-3'],
    rank: 4,
  },
  {
    id: 'user-5',
    name: 'Sam Okafor',
    email: 'sam@focusarena.dev',
    points: 1560,
    streak: 3,
    totalStudyMinutes: 780,
    groupIds: ['group-2', 'group-3'],
    rank: 5,
  },
];

// ── Groups ───────────────────────────────────────────────────────────────────
// Shape: { id, name, description, memberIds, totalStudyMinutes, totalPoints, createdAt }

export const mockGroups = [
  {
    id: 'group-1',
    name: 'DSA Grinders',
    description: 'Cracking data structures and algorithms together, one problem at a time.',
    memberIds: ['user-1', 'user-2', 'user-4'],
    totalStudyMinutes: 4575,
    totalPoints: 9150,
    createdAt: '2025-05-01',
  },
  {
    id: 'group-2',
    name: 'Full Stack Focus',
    description: 'React, Node.js, and PostgreSQL — the whole stack under one roof.',
    memberIds: ['user-1', 'user-3', 'user-5'],
    totalStudyMinutes: 4075,
    totalPoints: 8150,
    createdAt: '2025-05-08',
  },
  {
    id: 'group-3',
    name: 'Weekend Warriors',
    description: 'Saturday and Sunday deep-work sessions to stay ahead of the week.',
    memberIds: ['user-2', 'user-4', 'user-5'],
    totalStudyMinutes: 3435,
    totalPoints: 6870,
    createdAt: '2025-05-15',
  },
];

// ── Study Sessions ────────────────────────────────────────────────────────────
// Shape: { id, userId, subject, durationMinutes, date }
// Subjects: 'DSA' | 'React' | 'Node.js' | 'PostgreSQL' | 'Other'
// Dates spread across today and the past 4 days.

const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmt(d);
};

export const mockSessions = [
  // Today
  { id: 'session-1',  userId: 'user-1', subject: 'DSA',        durationMinutes: 60,  date: daysAgo(0) },
  { id: 'session-2',  userId: 'user-1', subject: 'React',      durationMinutes: 45,  date: daysAgo(0) },
  { id: 'session-3',  userId: 'user-2', subject: 'Node.js',    durationMinutes: 90,  date: daysAgo(0) },
  // 1 day ago
  { id: 'session-4',  userId: 'user-1', subject: 'PostgreSQL', durationMinutes: 75,  date: daysAgo(1) },
  { id: 'session-5',  userId: 'user-3', subject: 'DSA',        durationMinutes: 120, date: daysAgo(1) },
  { id: 'session-6',  userId: 'user-4', subject: 'React',      durationMinutes: 60,  date: daysAgo(1) },
  // 2 days ago
  { id: 'session-7',  userId: 'user-1', subject: 'DSA',        durationMinutes: 90,  date: daysAgo(2) },
  { id: 'session-8',  userId: 'user-2', subject: 'PostgreSQL', durationMinutes: 45,  date: daysAgo(2) },
  { id: 'session-9',  userId: 'user-5', subject: 'Other',      durationMinutes: 30,  date: daysAgo(2) },
  // 3 days ago
  { id: 'session-10', userId: 'user-3', subject: 'Node.js',    durationMinutes: 60,  date: daysAgo(3) },
  { id: 'session-11', userId: 'user-4', subject: 'DSA',        durationMinutes: 50,  date: daysAgo(3) },
  // 4 days ago
  { id: 'session-12', userId: 'user-1', subject: 'React',      durationMinutes: 80,  date: daysAgo(4) },
  { id: 'session-13', userId: 'user-5', subject: 'Node.js',    durationMinutes: 40,  date: daysAgo(4) },
];

// ── Leaderboard Datasets ──────────────────────────────────────────────────────
// Shape per entry: { rank, userId, username, studyTimeMinutes, points, streak }
// Four separate arrays simulate filter behaviour (Today / This Week / This Month / All Time).
// Rankings shift slightly across filters to make the data feel authentic.

/** Today: Alex dominates with a focused morning session */
export const leaderboardToday = [
  { rank: 1, userId: 'user-1', username: 'Alex Johnson', studyTimeMinutes: 105, points: 210,  streak: 14 },
  { rank: 2, userId: 'user-2', username: 'Maria Garcia', studyTimeMinutes: 90,  points: 180,  streak: 10 },
  { rank: 3, userId: 'user-3', username: 'James Lee',    studyTimeMinutes: 60,  points: 120,  streak: 7  },
  { rank: 4, userId: 'user-4', username: 'Priya Patel',  studyTimeMinutes: 45,  points: 90,   streak: 5  },
  { rank: 5, userId: 'user-5', username: 'Sam Okafor',   studyTimeMinutes: 20,  points: 40,   streak: 3  },
];

/** This Week: Maria closes the gap with a strong mid-week push */
export const leaderboardWeek = [
  { rank: 1, userId: 'user-1', username: 'Alex Johnson', studyTimeMinutes: 475, points: 950,  streak: 14 },
  { rank: 2, userId: 'user-2', username: 'Maria Garcia', studyTimeMinutes: 420, points: 840,  streak: 10 },
  { rank: 3, userId: 'user-3', username: 'James Lee',    studyTimeMinutes: 350, points: 700,  streak: 7  },
  { rank: 4, userId: 'user-4', username: 'Priya Patel',  studyTimeMinutes: 260, points: 520,  streak: 5  },
  { rank: 5, userId: 'user-5', username: 'Sam Okafor',   studyTimeMinutes: 195, points: 390,  streak: 3  },
];

/** This Month: James overtakes Maria for second place */
export const leaderboardMonth = [
  { rank: 1, userId: 'user-1', username: 'Alex Johnson', studyTimeMinutes: 1100, points: 2200, streak: 14 },
  { rank: 2, userId: 'user-3', username: 'James Lee',    studyTimeMinutes: 980,  points: 1960, streak: 7  },
  { rank: 3, userId: 'user-2', username: 'Maria Garcia', studyTimeMinutes: 920,  points: 1840, streak: 10 },
  { rank: 4, userId: 'user-4', username: 'Priya Patel',  studyTimeMinutes: 730,  points: 1460, streak: 5  },
  { rank: 5, userId: 'user-5', username: 'Sam Okafor',   studyTimeMinutes: 510,  points: 1020, streak: 3  },
];

/** All Time: overall standings matching each user's totalStudyMinutes / points */
export const leaderboardAllTime = [
  { rank: 1, userId: 'user-1', username: 'Alex Johnson', studyTimeMinutes: 1920, points: 3840, streak: 14 },
  { rank: 2, userId: 'user-2', username: 'Maria Garcia', studyTimeMinutes: 1605, points: 3210, streak: 10 },
  { rank: 3, userId: 'user-3', username: 'James Lee',    studyTimeMinutes: 1375, points: 2750, streak: 7  },
  { rank: 4, userId: 'user-4', username: 'Priya Patel',  studyTimeMinutes: 1050, points: 2100, streak: 5  },
  { rank: 5, userId: 'user-5', username: 'Sam Okafor',   studyTimeMinutes: 780,  points: 1560, streak: 3  },
];
