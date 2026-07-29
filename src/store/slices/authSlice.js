import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(credentials)
      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Login failed'
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(payload)
      return data
    } catch (err) {
      const errs = err.response?.data?.errors
      const msg = errs
        ? Object.values(errs).flat().join(' · ')
        : err.response?.data?.message || 'Registration failed'
      return rejectWithValue(msg)
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authAPI.logout()
  } catch {
    // ignore — still clear locally
  }
  return true
})

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.me()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const initialState = {
  user:   null,
  token:  null,
  status: 'idle', // idle | loading | success | error
  error:  null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state, action) {
      state.token = action.payload?.token || null
      state.user = action.payload?.user || null
      state.status = 'idle'
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'success'
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'success'
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = 'idle'
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.token = null
      })
  },
})

export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectIsAdmin = (state) => Boolean(state.auth.user?.is_admin)

export const { hydrateAuth, clearError } = authSlice.actions
export default authSlice.reducer
