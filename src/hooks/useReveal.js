import { useEffect } from 'react'

/**
 * Adds the `.in` class to `.reveal`, `.ing-card`, `.badge`, and `.anim-title`
 * elements once they intersect the viewport — mirroring the reference design's
 * scroll-triggered reveals.
 *
 * Uses both an IntersectionObserver (for visibility) and a MutationObserver
 * (so newly-rendered elements — e.g. product cards loaded from the API —
 * also get observed without needing a re-mount).
 */
export function useReveal() {
  useEffect(() => {
    const seen = new WeakSet()

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    const SELECTOR = '.reveal, .ing-card, .badge, .anim-title, .review-card'

    const observe = (root = document) => {
      root.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el) || el.classList.contains('in')) return
        seen.add(el)

        // If it's already in view at the time of observation, reveal immediately.
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
          el.classList.add('in')
        } else {
          io.observe(el)
        }
      })
    }

    // Observe everything currently in the DOM.
    observe()

    // Watch for new matching elements being added (e.g. when async data renders).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return // element nodes only
          if (node.matches?.(SELECTOR)) observe(node.parentNode || document)
          else observe(node)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
