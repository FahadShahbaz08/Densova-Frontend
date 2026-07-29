import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  mobileNavOpen: false,
  cartDrawerOpen: false,
  toast: null, // { type: 'success'|'error'|'info', message: string }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen
    },
    closeMobileNav(state) {
      state.mobileNavOpen = false
    },
    openCartDrawer(state) {
      state.cartDrawerOpen = true
    },
    closeCartDrawer(state) {
      state.cartDrawerOpen = false
    },
    showToast(state, action) {
      state.toast = action.payload
    },
    clearToast(state) {
      state.toast = null
    },
  },
})

export const selectMobileNavOpen = (state) => state.ui.mobileNavOpen
export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen
export const selectToast = (state) => state.ui.toast

export const {
  toggleMobileNav,
  closeMobileNav,
  openCartDrawer,
  closeCartDrawer,
  showToast,
  clearToast,
} = uiSlice.actions

export default uiSlice.reducer
