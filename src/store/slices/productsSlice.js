import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productsAPI } from '../../services/api'

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await productsAPI.getAll(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchOne',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await productsAPI.getBySlug(slug)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const initialState = {
  list:      [],
  meta:      { total: 0, current_page: 1 },
  selected:  null,
  loading:   false,
  error:     null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data
        state.meta = action.payload.meta || state.meta
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const selectProducts = (state) => state.products.list
export const selectSelectedProduct = (state) => state.products.selected
export const selectProductsLoading = (state) => state.products.loading
export const selectProductsError = (state) => state.products.error

export const { clearSelected } = productsSlice.actions
export default productsSlice.reducer
