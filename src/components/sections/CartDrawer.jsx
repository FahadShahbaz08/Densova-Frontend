import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from '../../router'
import { useCart } from '../../hooks/useCart'
import { resolveImageUrl } from '../../utils/resolveImageUrl'
import { selectCartDrawerOpen, closeCartDrawer } from '../../store/slices/uiSlice'
import { selectDeliveryCharges } from '../../store/slices/settingsSlice'

const rs = (n) => 'Rs ' + Number(n).toLocaleString('en-PK')

// Mirrors the reference design's "Your cart is quiet." empty state.
function EmptyState({ onBrowse }) {
  return (
    <div className="cart-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M6 7h12l-1.2 11.4a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
      <h4>Your cart is quiet.</h4>
      <p>Begin a ritual — your selections will rest here.</p>
      <button className="btn btn-ghost" onClick={onBrowse}>
        Browse Collection
      </button>
    </div>
  )
}

// Single line item — same DOM shape as the reference renderCart() output.
function CartItem({ item, onQty, onRemove }) {
  const sizeLabel = item.category === 'bundle' ? '2 × 250 ml' : '250 ml'
  return (
    <div className="cart-item">
      <div className="ci-img">
        {item.image_url
          ? <img src={resolveImageUrl(item.image_url)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          : <div className="mini-bottle" />
        }
      </div>
      <div className="ci-info">
        <h4 className="ci-name">{item.name}</h4>
        <p className="ci-sub">
          {sizeLabel} &middot; {rs(item.price)}
        </p>
        <div className="ci-row">
          <div className="ci-qty">
            <button onClick={() => onQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
            <span>{item.qty}</span>
            <button onClick={() => onQty(item.id, item.qty + 1)} aria-label="Increase">+</button>
          </div>
          <span className="ci-price">{rs(item.price * item.qty)}</span>
        </div>
        <button className="ci-remove" onClick={() => onRemove(item.id)}>
          Remove
        </button>
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const open = useSelector(selectCartDrawerOpen)
  const delivery = useSelector(selectDeliveryCharges)
  const { items, count, subtotal, total, setQty, remove } = useCart()

  const freeShipping = !!delivery?.free_shipping
  const freeOver = delivery?.free_over ?? 5000
  const shippingIsFree = freeShipping || subtotal >= freeOver

  const close = () => dispatch(closeCartDrawer())
  const goToCheckout = () => {
    dispatch(closeCartDrawer())
    navigate('/checkout')
  }

  return (
    <>
      <div className={`overlay${open ? ' show' : ''}`} onClick={close} />

      <aside className={`drawer${open ? ' show' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <h3>
            Your Cart
            <span className="count">
              {count > 0 ? ` · ${count} item${count > 1 ? 's' : ''}` : ''}
            </span>
          </h3>
          <button className="drawer-close" onClick={close} aria-label="Close cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <EmptyState onBrowse={close} />
          ) : (
            items.map((item) => (
              <CartItem key={item.id} item={item} onQty={setQty} onRemove={remove} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-row">
              <span>Subtotal</span>
              <span>{rs(subtotal)}</span>
            </div>
            <div className="cart-row">
              <span>Shipping</span>
              <span>
                {shippingIsFree ? 'Free' : 'Calculated at checkout'}
              </span>
            </div>
            <div className="cart-row total">
              <span>Total</span>
              <span>{rs(total)}</span>
            </div>
            <button
              className="btn btn-gold"
              onClick={goToCheckout}
            >
              Proceed to Checkout
              <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <p className="cart-promo">
              {freeShipping ? 'Free shipping on all orders' : `Free shipping over ${rs(freeOver)}`} &middot; 30-day Ritual Promise
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
