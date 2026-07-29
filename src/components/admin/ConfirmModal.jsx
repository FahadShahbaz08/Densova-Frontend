import { useAdminUI } from './AdminContext'

export default function ConfirmModal() {
  const { confirm, closeConfirm } = useAdminUI()
  if (!confirm) return null

  function handleYes() {
    confirm.onYes()
    closeConfirm()
  }

  return (
    <div className="admin-modal show" style={{ zIndex: 120 }}>
      <div className="modal-bd" onClick={closeConfirm} />
      <div className="modal-box sm">
        <div className="modal-body" style={{ padding: '30px 30px 20px', textAlign: 'center' }}>
          <div className="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 22, margin: '0 0 8px' }}>
            {confirm.title}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{confirm.text}</p>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={closeConfirm}>Cancel</button>
          <button className="btn btn-danger" onClick={handleYes}>
            {confirm.yesLabel || 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
