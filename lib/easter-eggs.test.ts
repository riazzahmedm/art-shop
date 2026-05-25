/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useKonamiCode } from './easter-eggs'

describe('useKonamiCode', () => {
  it('starts inactive', () => {
    const { result } = renderHook(() => useKonamiCode())
    expect(result.current).toBe(false)
  })

  it('activates after full konami sequence', () => {
    const { result } = renderHook(() => useKonamiCode())
    const sequence = [
      'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
      'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
      'b','a'
    ]
    act(() => {
      sequence.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
      })
    })
    expect(result.current).toBe(true)
  })
})
