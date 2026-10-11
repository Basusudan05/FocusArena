import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from '../utils/validation'

describe('validateEmail', () => {
  it('returns null for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull()
  })

  it('returns error for missing @', () => {
    expect(validateEmail('notanemail')).toBeTruthy()
  })

  it('returns error for empty string', () => {
    expect(validateEmail('')).toBeTruthy()
  })

  it('returns error for email without TLD', () => {
    expect(validateEmail('user@domain')).toBeTruthy()
  })
})

describe('validatePassword', () => {
  it('returns null for password of exactly 8 chars', () => {
    expect(validatePassword('abcd1234')).toBeNull()
  })

  it('returns error for password of 7 chars', () => {
    expect(validatePassword('abcd123')).toBeTruthy()
  })

  it('returns error for empty password', () => {
    expect(validatePassword('')).toBeTruthy()
  })

  it('returns null for password longer than 8 chars', () => {
    expect(validatePassword('supersecret123')).toBeNull()
  })
})

describe('validatePasswordMatch', () => {
  it('returns null when passwords match', () => {
    expect(validatePasswordMatch('password1', 'password1')).toBeNull()
  })

  it('returns error when passwords do not match', () => {
    expect(validatePasswordMatch('password1', 'password2')).toBeTruthy()
  })

  it('returns error for empty vs non-empty', () => {
    expect(validatePasswordMatch('', 'password')).toBeTruthy()
  })
})

describe('validateRequired', () => {
  it('returns null for a valid non-empty value', () => {
    expect(validateRequired('hello', 'Name')).toBeNull()
  })

  it('returns error for empty string', () => {
    expect(validateRequired('', 'Name')).toBeTruthy()
  })

  it('returns error for whitespace-only string', () => {
    expect(validateRequired('   ', 'Name')).toBeTruthy()
  })
})
