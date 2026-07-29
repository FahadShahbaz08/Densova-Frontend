import { useSelector } from 'react-redux'
import { selectWhatsAppNumber } from '../../store/slices/settingsSlice'

/**
 * Floating WhatsApp button (bottom-right on every page).
 * Reads the business number from public settings.
 */
export default function WhatsAppFloat() {
  const number = useSelector(selectWhatsAppNumber) || '+923103789079'
  const cleanNumber = number.replace(/[^\d]/g, '')
  const message = encodeURIComponent(
    'Assalam-o-Alaikum! I have a question about a Densova product.'
  )
  const href = `https://wa.me/${cleanNumber}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.218-.218-1.182-1.18-1.182-1.479 0-.301.281-.483.461-.661.218-.215.473-.41.665-.622.099-.105.105-.211.196-.302.198-.198.327-.453.467-.692.131-.235.219-.451.219-.677.001-.226-.085-.426-.297-.563-.31-.196-.61-.339-.918-.514a.732.732 0 0 0-.351-.119c-.243 0-.412.105-.594.262-.243.205-.466.495-.65.794-.234.378-.46.789-.69 1.18-.327.59-.652 1.131-.997 1.71-.42.7-.957 1.398-1.486 2.011-.62.72-1.255 1.34-1.892 1.94a30.43 30.43 0 0 1-2.51 2.156c-.85.65-1.732 1.27-2.667 1.793-.95.529-1.948.945-2.989 1.235a17.55 17.55 0 0 1-.873.224c-.282.05-.563.07-.85.07a4.92 4.92 0 0 1-2.024-.532A11.91 11.91 0 0 1 4.001 16C4 9.373 9.373 4 16 4s12 5.373 12 12-5.373 12-12 12c-2.124 0-4.118-.553-5.85-1.523" />
      </svg>
    </a>
  )
}
