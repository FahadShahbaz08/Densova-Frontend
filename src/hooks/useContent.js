import { useSelector } from 'react-redux'
import { selectSettings } from '../store/slices/settingsSlice'

/**
 * Returns a content setting value (already parsed from JSON in the API).
 * Falls back to the provided default if the key isn't set yet.
 *
 *   const hero = useContent('content_hero', { headline: 'Default headline' })
 */
export function useContent(key, fallback = null) {
  const settings = useSelector(selectSettings)
  const v = settings?.[key]
  if (v === undefined || v === null || v === '') return fallback
  return v
}
