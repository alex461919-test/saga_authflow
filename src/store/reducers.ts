import { createAction, createReducer } from '@reduxjs/toolkit';
import { AuthState, AuthStatus, Profile, Credential } from './auth';

enum ActionsType {
  SET_LOGIN_SUCCESS = 'api/auth/set_login_success',
  SET_LOGIN_FAILURE = 'api/auth/set_login_failure',
  SET_LOGOUT = 'api/auth/set_logout',
  SET_TOKEN = 'api/auth/set_token',
  SET_PROFILE = 'api/auth/set_profile',
  ADD_FETCH_PROCESS = '/api/fetch_processes/add',
  REMOVE_FETCH_PROCESS = '/api/fetch_processes/remove',
  ON_LOGIN = 'api/auth/on_login',
  ON_LOGOUT = 'api/auth/on_logout',
  ON_GET_PROFILE = 'api/auth/on_get_profile',
  ON_LOGIN_FAILURE = 'api/auth/on_login_failure',
}

const onLogout = createAction(ActionsType.ON_LOGOUT);
const onLogin = createAction<Credential>(ActionsType.ON_LOGIN);
const onGetProfile = createAction(ActionsType.ON_GET_PROFILE);

const setLoginSuccess = createAction<{ profile: Profile; token?: string }>(ActionsType.SET_LOGIN_SUCCESS);
const setLoginFailure = createAction<string>(ActionsType.SET_LOGIN_FAILURE);
const setLogout = createAction(ActionsType.SET_LOGOUT);
const setToken = createAction<string>(ActionsType.SET_TOKEN);
const setProfile = createAction<Profile>(ActionsType.SET_PROFILE);

const addFetchProcess = createAction<string>(ActionsType.ADD_FETCH_PROCESS);
const removeFetchProcess = createAction<string>(ActionsType.REMOVE_FETCH_PROCESS);

export { ActionsType, setLoginFailure, setLoginSuccess, setLogout, setToken, onLogout };
export { addFetchProcess, removeFetchProcess };
export { onGetProfile, onLogin /*onLogout*/ };

const initialState = {
  auth: { profile: null, error: null, token: null, status: AuthStatus.LoggedOut } as AuthState,
  fetchProcess: [] as string[],
};

export const apiReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setLoginSuccess, (state, { payload }) => {
      state.auth.profile = payload.profile;
      payload.token && (state.auth.token = payload.token);
      state.auth.error = null;
      state.auth.status = AuthStatus.LoggedIn;
    })
    .addCase(setLoginFailure, (state, { payload: error }) => {
      state.auth = { profile: null, token: null, error: error, status: AuthStatus.Error };
    })
    .addCase(setLogout, (state) => {
      state.auth = { profile: null, token: null, error: null, status: AuthStatus.LoggedOut };
    })
    .addCase(setProfile, (state, { payload: profile }) => {
      state.auth = { ...state.auth, error: null, profile };
    })
    .addCase(setToken, (state, { payload: token }) => {
      state.auth = { ...state.auth, token };
    })
    .addCase(addFetchProcess, (state, { payload: process }) => {
      state.fetchProcess = [...state.fetchProcess, process];
    })
    .addCase(removeFetchProcess, (state, { payload: process }) => {
      state.fetchProcess = state.fetchProcess.filter((item) => item !== process);
    });
});
