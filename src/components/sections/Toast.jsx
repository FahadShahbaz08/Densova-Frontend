import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectToast, clearToast } from '../../store/slices/uiSlice'

/**
 * Brief slide-up notification at the bottom of the screen.
 * Driven by ui.toast in Redux; auto-dismisses after 2.4s.
 */
export default function Toast() {
  const dispatch = useDispatch()
  const toast = useSelector(selectToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => dispatch(clearToast()), 2400)
    return () => clearTimeout(t)
  }, [toast, dispatch])

  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M5 12l5 5L20 7" />
      </svg>
      <span>{toast?.message || ''}</span>
    </div>
  )
}
