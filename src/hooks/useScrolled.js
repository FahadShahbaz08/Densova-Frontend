import { useState, useEffect } from 'react'

/**
 * Returns `true` once the user scrolls past `threshold` pixels.
 * Used by the sticky nav to switch its background opacity.
 */
export function useScrolled(threshold = 50) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])

  return scrolled
}
