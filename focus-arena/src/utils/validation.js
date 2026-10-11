/**
 * FocusArena — Form Validation Utilities
 * Each function returns an error string or null (no error).
 */

/**
 * Validates email format: must match local@domain.tld pattern.
 * @param {string} value
 * @returns {string|null}
 */
export function validateEmail(value) {
  if (!value || value.trim() === '') return 'Email is required.'
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(value.trim())) return 'Please enter a valid email address.'
  return null
}

/**
 * Validates password length — must be at least 8 characters.
 * @param {string} value
 * @returns {string|null}
 */
export function validatePassword(value) {
  if (!value || value.length === 0) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  return null
}

/**
 * Validates that two passwords match.
 * @param {string} a - password
 * @param {string} b - confirm password
 * @returns {string|null}
 */
export function validatePasswordMatch(a, b) {
  if (a !== b) return 'Passwords do not match.'
  return null
}

/**
 * Validates that a required field is not empty or whitespace.
 * @param {string} value
 * @param {string} fieldName - used in the error message
 * @returns {string|null}
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || value.trim() === '') return `${fieldName} is required.`
  return null
}
