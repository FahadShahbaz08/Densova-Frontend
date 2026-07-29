import { useDispatch, useSelector } from 'react-redux'
import {
  addItem,
  removeItem,
  updateQty,
  clearCart,
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectCartShipping,
  selectCartTotal,
} from '../store/slices/cartSlice'

/**
 * Convenience hook so components don't need to import slice actions.
 */
export function useCart() {
  const dispatch = useDispatch()

  return {
    items:    useSelector(selectCartItems),
    count:    useSelector(selectCartCount),
    subtotal: useSelector(selectCartSubtotal),
    shipping: useSelector(selectCartShipping),
    total:    useSelector(selectCartTotal),
    add:      (product) => dispatch(addItem(product)),
    remove:   (id)      => dispatch(removeItem(id)),
    setQty:   (id, qty) => dispatch(updateQty({ id, qty })),
    clear:    ()        => dispatch(clearCart()),
  }
}
