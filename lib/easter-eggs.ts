import { useState, useEffect, useRef } from 'react'

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a',
]

export function useKonamiCode(): boolean {
  const [activated, setActivated] = useState(false)
  const progressRef = useRef(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const progress = progressRef.current
      if (e.key === KONAMI[progress]) {
        const next = progress + 1
        if (next === KONAMI.length) {
          setActivated(true)
          progressRef.current = 0
        } else {
          progressRef.current = next
        }
      } else {
        progressRef.current = 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return activated
}

export function useLogoTap(threshold = 5): [boolean, () => void] {
  const [taps, setTaps] = useState(0)
  const [activated, setActivated] = useState(false)

  function tap() {
    const next = taps + 1
    if (next >= threshold) {
      setActivated(true)
      setTaps(0)
    } else {
      setTaps(next)
    }
  }

  return [activated, tap]
}

export function useSecretTyping(word: string): boolean {
  const [matched, setMatched] = useState(false)
  const bufferRef = useRef('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      bufferRef.current = (bufferRef.current + e.key).slice(-word.length)
      const isMatch = bufferRef.current === word
      setMatched(isMatch)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [word])

  return matched
}
