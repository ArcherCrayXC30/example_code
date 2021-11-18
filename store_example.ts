import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { login, refresh, logout, Tokens } from '../services/auth'
import { UserModel } from '../services/user'
import { AppThunk, AppState } from '.'

interface Auth {
  error?: string
  isTokensRefreshing: boolean
  readyStatus: string
  tokens?: Tokens
  user?: UserModel
}

export const initialState: Auth = {
  isTokensRefreshing: false,
  readyStatus: 'INVALID',
}

interface LoginSuccess {
  tokens: Tokens
  user: UserModel
}

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    getLoginRequesting: (state: Auth) => {
      state.readyStatus = 'REQUEST'
    },
    getLoginSuccess: (state, { payload }: PayloadAction<LoginSuccess>) => {
      state.readyStatus = 'SUCCESS'
      state.tokens = payload.tokens
      state.user = payload.user
    },
    getLoginFailure: (state, { payload }: PayloadAction<string>) => {
      state.readyStatus = 'FAILURE'
      state.error = payload
      state.isTokensRefreshing = false
    },
    getRefreshRequesting: (state) => {
      state.readyStatus = 'REQUEST'
      state.isTokensRefreshing = true
    },
    getRefreshSuccess: (state, { payload }: PayloadAction<Tokens>) => {
      state.readyStatus = 'SUCCESS'
      state.isTokensRefreshing = false
      state.tokens = payload
    },
    getRefreshFailure: (state, { payload }: PayloadAction<string>) => {
      state.readyStatus = 'FAILURE'
      state.error = payload
      state.isTokensRefreshing = false
    },
    getLogoutFailure: (state, { payload }: PayloadAction<string>) => {
      state.readyStatus = 'FAILURE'
      state.error = payload
    },
    getLogoutSuccess: (state) => {
      state.readyStatus = 'INVALID'
      state.isTokensRefreshing = false
      state.tokens = undefined
      state.user = undefined
    },
  },
})

export default auth.reducer
export const {
  getLoginFailure,
  getLoginRequesting,
  getLoginSuccess,
  getLogoutFailure,
  getLogoutSuccess,
  getRefreshFailure,
  getRefreshRequesting,
  getRefreshSuccess,
} = auth.actions

export const fetchAuth = (email: string, password: string): AppThunk => async (dispatch) => {
  dispatch(getLoginRequesting())

  const { data, error } = await login(email, password)

  if (error) {
    dispatch(getLoginFailure(error.message))
  } else if (data) {
    dispatch(getLoginSuccess(data))
  }
}

const shouldFetchAuth = (state: AppState) => state.userList.readyStatus !== 'SUCCESS'

export const fetchAuthIfNeed = (email: string, password: string): AppThunk => (
  dispatch,
  getState
) => {
  if (shouldFetchAuth(getState())) {
    return dispatch(fetchAuth(email, password))
  }

  return null
}

export const refreshTokens = (token: string): AppThunk => async (dispatch) => {
  dispatch(getRefreshRequesting())

  const { data, error } = await refresh(token)

  if (error) {
    dispatch(getRefreshFailure(error.message))
  } else if (data) {
    dispatch(getRefreshSuccess(data))
  }
}

export const doLogout = (all?: boolean): AppThunk => async (dispatch, getState: () => AppState) => {
  const { refreshToken } = getState().auth.tokens || {}

  if (refreshToken) {
    const { error } = await logout(refreshToken, all)

    if (error) {
      dispatch(getLogoutFailure(error.message))
    } else {
      dispatch(getLogoutSuccess())
    }
  }
}
