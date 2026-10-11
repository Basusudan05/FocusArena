import { useState, useEffect, useRef } from 'react'

const SUBJECTS = ['DSA', 'React', 'Node.js', 'PostgreSQL', 'Other']

/**
 * useTimer — manages study timer state.
 *
 * Returns:
 *   elapsedSeconds  (number)
 *   isRunning       (boolean)
 *   subject         (string)
 *   start()         — begin or resume counting
 *   pause()         — pause counting
 *   reset()         — stop and zero out
 *   setSubject(s)   — change selected subject (only when not running)
 *   getSession()    — returns { subject, durationMinutes, date } or null if < 1 min
 */
function useTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [subject, setSubjectState] = useState(SUBJECTS[0])
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  function start() {
    setIsRunning(true)
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setElapsedSeconds(0)
  }

  function setSubject(s) {
    if (!isRunning) setSubjectState(s)
  }

  /**
   * Returns a session object if elapsed ≥ 60 seconds, otherwise null.
   */
  function getSession() {
    if (elapsedSeconds < 60) return null
    return {
      subject,
      durationMinutes: Math.floor(elapsedSeconds / 60),
      date: new Date().toISOString().slice(0, 10),
    }
  }

  return { elapsedSeconds, isRunning, subject, start, pause, reset, setSubject, getSession }
}

export { SUBJECTS }
export default useTimer
