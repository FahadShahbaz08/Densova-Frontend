import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingsAPI } from '../../services/api'

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await settingsAPI.getPublic()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const initialState = {
  data: {
    whatsapp_number: '+923103789079',
    business_phone: '+923103789079',
    business_email: 'care@densova.com',
    jazzcash_number: '',
    jazzcash_title: '',
    easypaisa_number: '',
    easypaisa_title: '',
    bank_name: '',
    bank_title: '',
    bank_account: '',
    bank_iban: '',
    jazzcash_enabled: true,
    easypaisa_enabled: true,
    bank_enabled: true,
    iban_enabled: true,
    advance_discount_pct: 5,
    delivery_charges: {
      free_shipping: false,
      default: 350,
      free_over: 5000,
      cities: {
        karachi: 250, lahore: 250, islamabad: 300, rawalpindi: 300,
      },
    },
  },
  loaded: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.data = { ...state.data, ...action.payload }
      state.loaded = true
    })
  },
})

export const selectSettings = (state) => state.settings.data
export const selectWhatsAppNumber = (state) => state.settings.data.whatsapp_number
export const selectDeliveryCharges = (state) => state.settings.data.delivery_charges
export const selectFreeShippingEnabled = (state) =>
  Boolean(state.settings.data.delivery_charges?.free_shipping)
export const selectAdvanceDiscountPct = (state) =>
  Number(state.settings.data.advance_discount_pct || 5)

export default settingsSlice.reducer
