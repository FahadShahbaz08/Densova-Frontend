import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [], // { id, name, slug, price, image_url, category, qty }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action) {
      state.items = Array.isArray(action.payload?.items) ? action.payload.items : []
    },
    addItem(state, action) {
      const product = action.payload
      const existing = state.items.find((i) => i.id === product.id)
      if (existing) {
        existing.qty += product.qty || 1
      } else {
        state.items.push({
          id:        product.id,
          name:      product.name,
          slug:      product.slug,
          price:     product.price,
          image_url: product.image_url,
          category:  product.category,
          qty:       product.qty || 1,
        })
      }
    },

    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },

    updateQty(state, action) {
      const { id, qty } = action.payload
      const item = state.items.find((i) => i.id === id)
      if (item) item.qty = Math.max(1, Math.min(100, qty))
    },

    clearCart(state) {
      state.items = []
    },
  },
})

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0)
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
// Real shipping is city-dependent and only known at checkout, so the cart
// itself carries no shipping charge. The drawer shows "Free" or
// "Calculated at checkout" based on the live delivery settings.
export const selectCartShipping = () => 0
export const selectCartTotal = (state) => selectCartSubtotal(state)

export const { hydrateCart, addItem, removeItem, updateQty, clearCart } = cartSlice.actions
export default cartSlice.reducer
