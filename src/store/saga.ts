import { take, put, call, Effect, select, all, takeLatest, fork, cancel, cancelled } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { Api, RootState } from '.';
import { AuthStatus, Credential, ProfileWithToken } from './auth';
import { ActionsType, setLoginFailure, setLoginSuccess, setLogout, setToken, onLogout } from './reducers';
import { Task } from 'redux-saga';

function* fetchData<P>(fn: any, ...args: any): Generator<Effect, P, any> {
  while (true) {
    try {
      const result: AxiosResponse<P> = yield call(fn, ...args);
      return result.data;
    } catch (error: any) {
      //

      const code: number | null = error.response ? error.response.status : null;
      const savedToken: string | null = yield select((state: RootState) => state.api.auth.token);

      if (code === 401 && savedToken) {
        try {
          const {
            data: { token },
          }: AxiosResponse<ProfileWithToken> = yield call(Api.axios.get, '/api/auth/refresh');
          yield put(setToken(token));
          yield call(Api.saveToken, token);
        } catch (refresh_error: any) {
          yield call(_set_logout);
          yield put(onLogout());
          throw refresh_error;
        }
      } else {
        throw error;
      }
    }
  }
}

function* authorize(username: string, password: string): Generator<Effect, void, any> {
  const controller = new AbortController();
  try {
    const {
      data: { token, ...profile },
    }: AxiosResponse<ProfileWithToken> = yield call(Api.axios.post, '/api/auth/login', { username, password }, { signal: controller.signal });

    console.log('authorize. profile: ', profile, '\ntoken: ', token);
    yield call(Api.saveToken, token);
    yield put(setLoginSuccess({ profile, token }));
  } catch (error: any) {
    console.log('error: ', error.response);
    const message: string = error.response
      ? error.response.data.error || error.response.data.message || error.response.statusText
      : error.message;
    yield put(setLoginFailure(message));
  } finally {
    if (yield cancelled()) {
      console.log('abort auth');
      controller.abort();
    }
  }
}

function* _set_logout(): Generator<Effect, void, void> {
  yield call(Api.removeToken);
  yield put(setLogout());
}

function* loginFlow(): Generator<Effect, void, any> {
  yield call(autoLogin);
  while (true) {
    let authorizeTask: Task | null = null;

    const status: AuthStatus = yield select((state: RootState) => state.api.auth.status);

    if (status !== AuthStatus.LoggedIn) {
      const loginActions: PayloadAction<Credential> | PayloadAction = yield take([ActionsType.ON_LOGIN]);

      if (loginActions.type === ActionsType.ON_LOGIN) {
        authorizeTask = yield fork(authorize, loginActions.payload!.username, loginActions.payload!.password);
      }
    }
    const logoutActions: PayloadAction<void, string> = yield take([ActionsType.ON_LOGOUT, ActionsType.ON_LOGIN_FAILURE]);

    if (logoutActions.type === ActionsType.ON_LOGOUT) {
      if (authorizeTask) yield cancel(authorizeTask);
      try {
        yield call(Api.axios.post, '/api/auth/logout', {}, { timeout: 500 });
      } catch (error: any) {}
      yield call(_set_logout);
    }
  }
}

function* autoLogin(): Generator<Effect, void, any> {
  const token: string | null = yield call(Api.getToken);
  if (token) {
    yield put(setToken(token));
    try {
      const { token, ...profile }: ProfileWithToken = yield call(fetchData, Api.axios.get, '/api/auth/profile');
      yield put(setLoginSuccess({ profile }));
    } catch (error: any) {
      const code: number | null = error.response ? error.response.status : null;
      if (code === 401) {
        yield call(_set_logout);
      }
    }
  }
}

function* profile(): Generator<Effect, void, any> {
  try {
    yield call(fetchData, Api.axios.get, '/api/auth/profile');
  } catch (error: any) {}
}

export default function* rootSaga() {
  yield all([call(loginFlow), takeLatest(ActionsType.ON_GET_PROFILE, profile)]);
}

export const exportedForTesting = { profile, autoLogin, loginFlow, _set_logout, authorize, fetchData };
