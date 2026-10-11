import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useTimer, { SUBJECTS } from '../hooks/useTimer'

describe('useTimer', () => {
  it('starts with elapsed=0 and isRunning=false', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.elapsedSeconds).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('sets isRunning to true on start()', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    expect(result.current.isRunning).toBe(true)
  })

  it('sets isRunning to false on pause()', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { result.current.pause() })
    expect(result.current.isRunning).toBe(false)
  })

  it('resets elapsed and isRunning on reset()', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { result.current.reset() })
    expect(result.current.elapsedSeconds).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('getSession() returns null when elapsed < 60s', () => {
    const { result } = renderHook(() => useTimer())
    // elapsed is 0, so < 60
    expect(result.current.getSession()).toBeNull()
  })

  it('default subject is the first SUBJECTS entry', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.subject).toBe(SUBJECTS[0])
  })

  it('setSubject updates subject when not running', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.setSubject('React') })
    expect(result.current.subject).toBe('React')
  })

  it('setSubject is ignored when running', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { result.current.setSubject('React') })
    expect(result.current.subject).toBe(SUBJECTS[0])
  })
})
