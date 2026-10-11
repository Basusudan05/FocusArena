import { describe, it, expect } from 'vitest'
import {
  mockUsers,
  mockGroups,
  mockSessions,
  leaderboardToday,
  leaderboardWeek,
  leaderboardMonth,
  leaderboardAllTime,
} from '../data/mockData'

describe('mockUsers', () => {
  it('has at least 5 users', () => {
    expect(mockUsers.length).toBeGreaterThanOrEqual(5)
  })

  it('each user has required fields', () => {
    for (const u of mockUsers) {
      expect(u.id).toBeTruthy()
      expect(u.name).toBeTruthy()
      expect(u.email).toBeTruthy()
      expect(typeof u.points).toBe('number')
      expect(typeof u.streak).toBe('number')
      expect(typeof u.totalStudyMinutes).toBe('number')
      expect(Array.isArray(u.groupIds)).toBe(true)
      expect(typeof u.rank).toBe('number')
    }
  })
})

describe('mockGroups', () => {
  it('has at least 3 groups', () => {
    expect(mockGroups.length).toBeGreaterThanOrEqual(3)
  })

  it('each group has required fields', () => {
    for (const g of mockGroups) {
      expect(g.id).toBeTruthy()
      expect(g.name).toBeTruthy()
      expect(g.description).toBeDefined()
      expect(Array.isArray(g.memberIds)).toBe(true)
      expect(typeof g.totalStudyMinutes).toBe('number')
      expect(typeof g.totalPoints).toBe('number')
      expect(g.createdAt).toBeTruthy()
    }
  })
})

describe('mockSessions', () => {
  it('has at least 10 sessions', () => {
    expect(mockSessions.length).toBeGreaterThanOrEqual(10)
  })

  it('each session has required fields', () => {
    const validSubjects = ['DSA', 'React', 'Node.js', 'PostgreSQL', 'Other']
    for (const s of mockSessions) {
      expect(s.id).toBeTruthy()
      expect(s.userId).toBeTruthy()
      expect(validSubjects).toContain(s.subject)
      expect(typeof s.durationMinutes).toBe('number')
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('leaderboard datasets', () => {
  const datasets = { leaderboardToday, leaderboardWeek, leaderboardMonth, leaderboardAllTime }

  for (const [name, dataset] of Object.entries(datasets)) {
    it(`${name} has entries with required fields`, () => {
      expect(dataset.length).toBeGreaterThan(0)
      for (const e of dataset) {
        expect(typeof e.rank).toBe('number')
        expect(e.userId).toBeTruthy()
        expect(e.username).toBeTruthy()
        expect(typeof e.studyTimeMinutes).toBe('number')
        expect(typeof e.points).toBe('number')
        expect(typeof e.streak).toBe('number')
      }
    })
  }
})
