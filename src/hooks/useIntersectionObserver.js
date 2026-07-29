import { useEffect, useRef, useState } from 'react'

/**
 * One-shot intersection observer for scroll-triggered reveals.
 * Returns [ref, inView]. Once inView fires, the observer disconnects
 * so the animation doesn't replay on every scroll.
 */
export function useIntersectionObserver(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px', ...options }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}
