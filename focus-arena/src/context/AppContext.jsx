import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sessionsApi } from '../lib/sessionsApi';
import { groupsApi } from '../lib/groupsApi';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);       // Supabase auth user
  const [profile, setProfile] = useState(null);         // profiles table row
  const [authLoading, setAuthLoading] = useState(true); // true until session resolved

  // ── App data ──────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [sessionsVersion, setSessionsVersion] = useState(0); // increments on each new save
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  // selectedGroupId: the group the user is currently studying in (null = personal only)
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // ── Profiles from API ─────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('fa-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fa-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  // ── Load profile for a given auth user ID via backend API ───────────────
  async function loadProfile(userId) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}
      const res = await fetch(`/api/profiles/${userId}`, { headers })
      if (!res.ok) {
        if (res.status === 404) return null
        console.error('Failed to load profile: HTTP', res.status)
        return null
      }
      return await res.json()
    } catch (err) {
      console.error('Failed to load profile:', err.message)
      return null
    }
  }

  // ── Load sessions for the authenticated user from the backend API ────────
  async function loadSessions() {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await sessionsApi.list();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err.message);
      setSessionsError(err.message);
    } finally {
      setSessionsLoading(false);
    }
  }

  // ── Load the user's groups from the backend API ───────────────────────────
  async function loadGroups() {
    setGroupsLoading(true);
    try {
      const data = await groupsApi.list();
      setGroups(data ?? []);
      // Auto-select first group if user has one and none is selected
      setSelectedGroupId((prev) => {
        if (prev) return prev; // keep existing selection
        return data?.[0]?.id ?? null;
      });
    } catch (err) {
      console.error('Failed to load groups:', err.message);
    } finally {
      setGroupsLoading(false);
    }
  }

  // ── Bootstrap auth session on mount ──────────────────────────────────────
  useEffect(() => {
    // Get current session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        const p = await loadProfile(session.user.id);
        setProfile(p);
        await Promise.all([loadSessions(), loadGroups()]);
      }
      setAuthLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          const p = await loadProfile(session.user.id);
          setProfile(p);
          await Promise.all([loadSessions(), loadGroups()]);
        } else {
          setAuthUser(null);
          setProfile(null);
          setSessions([]);
          setGroups([]);
          setSelectedGroupId(null);
        }
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch all profiles for leaderboard/members section ───────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}
      fetch('/api/profiles', { headers })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((data) => {
          setUsers(data)
          setUsersLoading(false)
        })
        .catch((err) => {
          setUsersError(err.message)
          setUsersLoading(false)
        })
    })
  }, [])

  // ── Auth actions ──────────────────────────────────────────────────────────
  async function register({ email, password, name }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error('Registration succeeded but no user ID returned.');

    // Upsert profile via backend using correct column names (full_name, not name)
    const { data: { session: newSession } } = await supabase.auth.getSession()
    const res = await fetch(`/api/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(newSession?.access_token ? { Authorization: `Bearer ${newSession.access_token}` } : {}),
      },
      body: JSON.stringify({ full_name: name, email }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Failed to create profile');
    }

    const p = await loadProfile(userId);
    setProfile(p);
    return data;
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Ensure a profile row exists (handles users registered before profile upsert was fixed)
    if (data.user?.id) {
      const { data: { session: loginSession } } = await supabase.auth.getSession()
      await fetch(`/api/profiles/${data.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(loginSession?.access_token ? { Authorization: `Bearer ${loginSession.access_token}` } : {}),
        },
        body: JSON.stringify({ email: data.user.email }),
      }).catch(() => {}); // non-fatal
    }

    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  function updateUser(updates) {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  // ── App actions ───────────────────────────────────────────────────────────
  /**
   * Save a session via the API and prepend it to local state on success.
   * Returns the saved session record, or throws on error.
   */
  async function addSession({ duration_minutes, group_id }) {
    const saved = await sessionsApi.create({ duration_minutes, group_id });
    setSessions((prev) => [saved, ...prev]);
    setSessionsVersion((v) => v + 1); // signal leaderboard to refresh
    return saved;
  }

  function addGroup(_group) {
    // Reload real groups from API to stay in sync
    loadGroups();
  }

  // Derive totals from real session data — profiles table has no points/study columns
  const totalPoints = sessions.reduce((sum, s) => sum + (s.points ?? 0), 0);
  const totalStudyMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);

  // currentUser maps profile columns to the shape the rest of the app expects.
  // Always provides safe defaults for fields the rest of the app reads.
  const currentUser = {
    // raw profile fields first (provides avatar_url, username, created_at, etc.)
    ...(profile ?? {}),
    // then explicit fields that override any profile columns of the same name
    id: profile?.id ?? authUser?.id ?? 'guest',
    name: profile?.full_name ?? profile?.username ?? authUser?.email?.split('@')[0] ?? 'User',
    email: profile?.email ?? authUser?.email ?? '',
    streak: profile?.streak ?? 0,
    groupIds: profile?.groupIds ?? [],
    rank: profile?.rank ?? 0,
    // derived from real session data — always override whatever profile says
    points: totalPoints,
    totalStudyMinutes,
  };

  const value = {
    // auth
    authUser,
    authLoading,
    isLoggedIn: Boolean(authUser),
    // user / profile
    currentUser,
    profile,
    updateUser,
    // auth actions
    register,
    login,
    logout,
    // app data
    sessions,
    sessionsVersion,
    groups,
    groupsLoading,
    selectedGroupId,
    setSelectedGroupId,
    addSession,
    addGroup,
    sessionsLoading,
    sessionsError,
    // all profiles (leaderboard / members)
    users,
    usersLoading,
    usersError,
    // theme
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
