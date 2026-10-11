import { createContext, useContext, useState, useEffect, useRef } from 'react'

export const SUBJECTS = ['DSA', 'React', 'Node.js', 'PostgreSQL', 'Other']

const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [subject, setSubjectState] = useState(SUBJECTS[0])
  const intervalRef = useRef(null)
  const startedAtRef = useRef(null) // wall-clock time when timer first started

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
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString()
    }
    setIsRunning(true)
  }

  function pause() { setIsRunning(false) }

  function reset() {
    setIsRunning(false)
    setElapsedSeconds(0)
    startedAtRef.current = null
  }

  function setSubject(s) { if (!isRunning) setSubjectState(s) }

  /**
   * Returns session data if elapsed ≥ 60s, otherwise null.
   * duration_minutes is floored; startedAt is the actual wall-clock start time.
   */
  function getSession() {
    if (elapsedSeconds < 60) return null
    return {
      subject,
      duration_minutes: Math.floor(elapsedSeconds / 60),
      // legacy shape fields kept for UI display compatibility
      durationMinutes: Math.floor(elapsedSeconds / 60),
      date: new Date().toISOString().slice(0, 10),
      startedAt: startedAtRef.current ?? new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
    }
  }

  return (
    <TimerContext.Provider value={{ elapsedSeconds, isRunning, subject, start, pause, reset, setSubject, getSession }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}
