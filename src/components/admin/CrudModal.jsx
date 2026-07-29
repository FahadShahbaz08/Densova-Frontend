import { useRef, useState } from 'react'
import { useAdminUI } from './AdminContext'
import FormBuilder from './FormBuilder'

export default function CrudModal() {
  const { crud, closeCrud, showToast } = useAdminUI()
  const [formData, setFormData] = useState({})
  const prevCrudId = useRef(null)

  // Reset the form buffer whenever a different dialog opens (or it closes).
  // Without this, the previous product's edits stay in `formData` and bleed
  // into the next save — cross-writing one product's data onto another.
  const crudKey = crud ? crud.title + JSON.stringify(crud.data) : null
  if (prevCrudId.current !== crudKey) {
    prevCrudId.current = crudKey
    setFormData({})
  }

  if (!crud) return null

  async function handleSave() {
    const merged = { ...(crud.data || {}), ...formData }
    const result = await crud.onSave(merged)
    if (result !== false) closeCrud()
  }

  function handleDelete() {
    closeCrud()
    crud.onDelete?.()
  }

  return (
    <>
      <div className="detail-overlay show" onClick={closeCrud} style={{ zIndex: 100 }} />
      <div className="admin-modal show" style={{ zIndex: 110 }}>
        <div className="modal-bd" onClick={closeCrud} />
        <div className="modal-box lg">
          <div className="modal-head">
            <div>
              <h3>{crud.title}</h3>
              {crud.sub && <div className="sub">{crud.sub}</div>}
            </div>
            <button className="dp-close" onClick={closeCrud}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="modal-body">
            <FormBuilder
              key={crudKey}
              spec={crud.spec}
              initialData={crud.data || {}}
              onChange={setFormData}
            />
          </div>
          <div className="modal-foot">
            {crud.onDelete ? (
              <button className="btn btn-danger" onClick={handleDelete}>
                {crud.deleteLabel || 'Delete'}
              </button>
            ) : <div />}
            <div className="right">
              <button className="btn btn-ghost" onClick={closeCrud}>Cancel</button>
              <button className="btn btn-gold" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
