import { createContext, useContext, useRef, useState, useCallback } from 'react'

const AdminUIContext = createContext(null)

export function AdminUIProvider({ children }) {
  const [toast, setToast]               = useState({ msg: '', err: false, show: false })
  const [crud, setCrud]                 = useState(null)   // { title, sub, spec, data, onSave, onDelete }
  const [confirm, setConfirm]           = useState(null)   // { title, text, onYes, yesLabel }
  const [detailPanel, setDetailPanel]   = useState(null)   // { mode: 'order'|'customer', id }
  const [flyerOrderId, setFlyerOrderId] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((msg, err = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, err, show: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600)
  }, [])

  const openCrud = useCallback((opts) => setCrud(opts), [])
  const closeCrud = useCallback(() => setCrud(null), [])

  const confirmAction = useCallback((title, text, onYes, yesLabel = 'Yes, delete') => {
    setConfirm({ title, text, onYes, yesLabel })
  }, [])
  const closeConfirm = useCallback(() => setConfirm(null), [])

  const openDetail = useCallback((mode, id) => setDetailPanel({ mode, id }), [])
  const closeDetail = useCallback(() => setDetailPanel(null), [])

  const openFlyer = useCallback((orderId) => setFlyerOrderId(orderId), [])
  const closeFlyer = useCallback(() => setFlyerOrderId(null), [])

  return (
    <AdminUIContext.Provider value={{
      toast, showToast,
      crud, openCrud, closeCrud,
      confirm, confirmAction, closeConfirm,
      detailPanel, openDetail, closeDetail,
      flyerOrderId, openFlyer, closeFlyer,
    }}>
      {children}
    </AdminUIContext.Provider>
  )
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext)
  if (!ctx) throw new Error('useAdminUI must be used within AdminUIProvider')
  return ctx
}
