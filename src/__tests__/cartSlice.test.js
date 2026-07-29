import { describe, it, expect } from 'vitest'
import cartReducer, {
  addItem,
  removeItem,
  updateQty,
  clearCart,
  selectCartSubtotal,
  selectCartCount,
  selectCartShipping,
} from '../store/slices/cartSlice'

const product = (overrides = {}) => ({
  id: 1, name: 'Herbal Oil', slug: 'herbal-oil', price: 50, image_url: null,
  ...overrides,
})

describe('cartSlice', () => {
  it('starts with no items', () => {
    expect(cartReducer(undefined, { type: 'init' })).toEqual({ items: [] })
  })

  it('adds a new item with qty 1', () => {
    const state = cartReducer(undefined, addItem(product()))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].qty).toBe(1)
  })

  it('increments qty when the same product is added twice', () => {
    let state = cartReducer(undefined, addItem(product()))
    state = cartReducer(state, addItem(product()))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].qty).toBe(2)
  })

  it('respects an explicit qty when adding', () => {
    const state = cartReducer(undefined, addItem(product({ qty: 3 })))
    expect(state.items[0].qty).toBe(3)
  })

  it('removes an item by id', () => {
    let state = cartReducer(undefined, addItem(product()))
    state = cartReducer(state, removeItem(1))
    expect(state.items).toHaveLength(0)
  })

  it('updates qty with clamping (min 1, max 100)', () => {
    let state = cartReducer(undefined, addItem(product()))
    state = cartReducer(state, updateQty({ id: 1, qty: 5 }))
    expect(state.items[0].qty).toBe(5)
    state = cartReducer(state, updateQty({ id: 1, qty: 0 }))
    expect(state.items[0].qty).toBe(1)
    state = cartReducer(state, updateQty({ id: 1, qty: 500 }))
    expect(state.items[0].qty).toBe(100)
  })

  it('clears the cart', () => {
    let state = cartReducer(undefined, addItem(product()))
    state = cartReducer(state, clearCart())
    expect(state.items).toHaveLength(0)
  })
})

describe('cart selectors', () => {
  const stateWith = (items) => ({ cart: { items } })

  it('calculates subtotal from line items', () => {
    expect(
      selectCartSubtotal(stateWith([
        { id: 1, price: 50, qty: 2 },
        { id: 2, price: 25, qty: 1 },
      ]))
    ).toBe(125)
  })

  it('counts total quantity', () => {
    expect(selectCartCount(stateWith([{ qty: 2 }, { qty: 3 }]))).toBe(5)
  })

  it('cart carries no shipping charge (calculated at checkout by city)', () => {
    expect(selectCartShipping(stateWith([{ price: 100, qty: 1 }]))).toBe(0)
    expect(selectCartShipping(stateWith([{ price: 30, qty: 1 }]))).toBe(0)
  })
})
