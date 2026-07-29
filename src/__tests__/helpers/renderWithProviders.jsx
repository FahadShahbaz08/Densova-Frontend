import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { RouterProvider } from '../../router'

import cartReducer from '../../store/slices/cartSlice'
import productsReducer from '../../store/slices/productsSlice'
import authReducer from '../../store/slices/authSlice'
import uiReducer from '../../store/slices/uiSlice'
import settingsReducer from '../../store/slices/settingsSlice'

/**
 * Builds a fresh Redux store for each test so state doesn't leak.
 * Pass `preloadedState` to seed the store with specific slices.
 */
export function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      cart:     cartReducer,
      products: productsReducer,
      auth:     authReducer,
      ui:       uiReducer,
      settings: settingsReducer,
    },
    preloadedState,
  })
}

/**
 * Custom RTL render that wraps with Redux and the Next-compatible router.
 */
export function renderWithProviders(
  ui,
  { preloadedState = {}, route = '/', store = makeStore(preloadedState), ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    window.history.replaceState({}, '', route)
    return (
      <Provider store={store}>
        <RouterProvider>{children}</RouterProvider>
      </Provider>
    )
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
