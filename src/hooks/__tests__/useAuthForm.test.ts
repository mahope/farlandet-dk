import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthForm } from '../useAuthForm'

describe('useAuthForm', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthForm())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.clearError).toBe('function')
    expect(typeof result.current.handleAuthAction).toBe('function')
  })

  it('should handle successful auth action', async () => {
    const { result } = renderHook(() => useAuthForm())
    const mockAction = vi.fn().mockResolvedValue(undefined)

    await act(async () => {
      await result.current.handleAuthAction(mockAction)
    })

    expect(mockAction).toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle auth action error', async () => {
    const { result } = renderHook(() => useAuthForm())
    const error = new Error('Authentication failed')
    const mockAction = vi.fn().mockRejectedValue(error)

    await act(async () => {
      await result.current.handleAuthAction(mockAction)
    })

    expect(mockAction).toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Authentication failed')
  })

  it('should handle unknown error', async () => {
    const { result } = renderHook(() => useAuthForm())
    const mockAction = vi.fn().mockRejectedValue('Unknown error')

    await act(async () => {
      await result.current.handleAuthAction(mockAction)
    })

    expect(result.current.error).toBe('An unexpected error occurred')
  })

  it('should set loading state during action', async () => {
    const { result } = renderHook(() => useAuthForm())
    let resolveAction: () => void
    const mockAction = vi.fn(() => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))

    // Start the action
    const actionPromise = act(async () => {
      return result.current.handleAuthAction(mockAction)
    })

    // Check loading state is true
    expect(result.current.loading).toBe(true)

    // Resolve the action
    act(() => {
      resolveAction()
    })

    await actionPromise

    // Check loading state is false
    expect(result.current.loading).toBe(false)
  })

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthForm())

    // Set an error first
    act(() => {
      result.current.handleAuthAction(() => Promise.reject(new Error('Test error')))
    })

    // Clear the error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })

  it('should clear error before new action', async () => {
    const { result } = renderHook(() => useAuthForm())

    // Set an error first
    await act(async () => {
      await result.current.handleAuthAction(() => Promise.reject(new Error('First error')))
    })

    expect(result.current.error).toBe('First error')

    // Execute successful action
    await act(async () => {
      await result.current.handleAuthAction(() => Promise.resolve())
    })

    expect(result.current.error).toBe(null)
  })
})