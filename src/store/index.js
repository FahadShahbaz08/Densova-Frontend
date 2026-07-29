import { configureStore } from '@reduxjs/toolkit'

import cartReducer from './slices/cartSlice'
import productsReducer from './slices/productsSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import settingsReducer from './slices/settingsSlice'
import { hydrateCart } from './slices/cartSlice'
import { hydrateAuth } from './slices/authSlice'

let storageHydrated = false

// Persist cart and auth token to localStorage between reloads.
const loadCart = () => {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem('densova_cart')
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

const loadAuth = () => {
  if (typeof window === 'undefined') return undefined
  try {
    const token = localStorage.getItem('densova_token')
    const userRaw = localStorage.getItem('densova_user')
    if (!token) return undefined
    return {
      token,
      user: userRaw ? JSON.parse(userRaw) : null,
      status: 'idle',
      error: null,
    }
  } catch {
    return undefined
  }
}

export const store = configureStore({
  reducer: {
    cart:     cartReducer,
    products: productsReducer,
    auth:     authReducer,
    ui:       uiReducer,
    settings: settingsReducer,
  },
})

export function hydrateStoreFromStorage() {
  if (storageHydrated || typeof window === 'undefined') return
  const cart = loadCart()
  const auth = loadAuth()
  if (cart) store.dispatch(hydrateCart(cart))
  if (auth) store.dispatch(hydrateAuth(auth))
  storageHydrated = true
}

// Persist relevant slices on every change.
store.subscribe(() => {
  if (typeof window === 'undefined' || !storageHydrated) return
  const state = store.getState()
  try {
    localStorage.setItem('densova_cart', JSON.stringify(state.cart))
    if (state.auth.token) {
      localStorage.setItem('densova_token', state.auth.token)
      localStorage.setItem('densova_user', JSON.stringify(state.auth.user))
    } else {
      localStorage.removeItem('densova_token')
      localStorage.removeItem('densova_user')
    }
    localStorage.removeItem('densova_admin_db_v3')
  } catch {
    // ignore storage errors (private mode, quota)
  }
})
