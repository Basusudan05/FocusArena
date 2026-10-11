# Design Document: FocusArena Integration

## Overview

This document covers the integration design for the FocusArena platform. The three existing layers — React/Vite frontend, Node.js/Express backend, and Supabase (PostgreSQL + Auth) — are already built. The integration work connects them correctly and fixes any gaps.

**Key design goals:**
- Preserve all working code; fix only what is broken or missing
- Ensure every protected page uses real API data, never mock data
- Enforce authorization at the API layer (not just the frontend)
- Keep the Supabase service-role key strictly server-side

---

## Architecture

```
Browser (React/Vite @ :5173 in dev, static in prod)
    │
    │  Supabase JS SDK (anon key only)
    ├───────