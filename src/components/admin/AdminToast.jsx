import { useAdminUI } from './AdminContext'

export default function AdminToast() {
  const { toast } = useAdminUI()
  return (
    <div className={`admin-toast${toast.show ? ' show' : ''}${toast.err ? ' err' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {toast.err
          ? <path d="M18 6L6 18M6 6l12 12" />
          : <path d="M5 12l5 5L20 7" />
        }
      </svg>
      <span>{toast.msg}</span>
    </div>
  )
}
