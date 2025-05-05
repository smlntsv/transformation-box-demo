import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce.ts'

describe('debounced function factory', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call the function after delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced('test')
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(199)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('test')
  })

  it('should only call the function once for rapid calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced('one')
    vi.advanceTimersByTime(100)
    debounced('two')
    vi.advanceTimersByTime(100)
    debounced('three')
    vi.advanceTimersByTime(200)

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('three')
  })
})
