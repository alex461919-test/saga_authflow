import { combineReducers } from '@reduxjs/toolkit';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { Api, reducer } from '../store';
import { exportedForTesting as saga_exports } from '../store/saga';
import { AuthState, AuthStatus } from '../store/auth';
import { call } from 'redux-saga/effects';
import { onLogout, setToken } from '../store/reducers';
import { throwError } from 'redux-saga-test-plan/providers';

describe('Тест саги fetchData.', () => {
  const fakeData = { token: 'token' };
  const error401 = { response: { status: 401, data: { error: 'error401' } } };
  const errorOther = { response: { status: 404, data: { error: 'error404' } } };
  const fakeAxiosFn = jest.fn();
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Успешный вызов axios. Должна вернуть data из вызова axios', () => {
    fakeAxiosFn.mockResolvedValueOnce({ data: fakeData });
    expect.assertions(2);
    return expectSaga(saga_exports.fetchData, fakeAxiosFn)
      .withReducer(combineReducers(reducer))
      .run()
      .then((result) => {
        expect(fakeAxiosFn).toBeCalledTimes(1);
        expect(result.returnValue).toBe(fakeData);
      });
  });

  test('Вызов axios с не 401 ошибкой. Должна выкинуть throw c ошибкой', () => {
    fakeAxiosFn.mockRejectedValueOnce(errorOther);
    expect.assertions(1);
    return expect(expectSaga(saga_exports.fetchData, fakeAxiosFn).withReducer(combineReducers(reducer)).run()).rejects.toBe(errorOther);
  });
  test('Вызов axios с 401 ошибкой без сохраненного токена. Должна выкинуть throw c ошибкой', () => {
    fakeAxiosFn.mockRejectedValueOnce(error401);
    expect.assertions(1);
    return expect(expectSaga(saga_exports.fetchData, fakeAxiosFn).withReducer(combineReducers(reducer)).run()).rejects.toBe(error401);
  });

  test('Вызов axios с 401 ошибкой с сохраненным токеном. Должны запросить token refresh и сохранить его.', () => {
    fakeAxiosFn.mockRejectedValueOnce(error401);
    fakeAxiosFn.mockResolvedValueOnce({ data: fakeData });

    const init = {
      auth: { profile: null, error: null, token: 'anytoken', status: AuthStatus.LoggedOut } as AuthState,
      fetchProcess: [] as string[],
    };
    expect.assertions(2);
    return expectSaga(saga_exports.fetchData, fakeAxiosFn)
      .provide([
        [call(Api.axios.get, '/api/auth/refresh'), { data: fakeData }],
        [matchers.call.fn(Api.saveToken), null],
      ])
      .withReducer(combineReducers(reducer), { api: init })
      .put(setToken(fakeData.token))
      .call(Api.saveToken, fakeData.token)
      .run()
      .then((result) => {
        expect(fakeAxiosFn).toBeCalledTimes(2);
        expect(result.returnValue).toBe(fakeData);
      });
  });

  test('Вызов axios с 401 ошибкой с сохраненным токеном. Должны запросить token refresh. Если не получается обновить токен, то должна выкинуть throw c ошибкой.', () => {
    fakeAxiosFn.mockRejectedValueOnce(error401);

    const init = {
      auth: { profile: null, error: null, token: 'anytoken', status: AuthStatus.LoggedOut } as AuthState,
      fetchProcess: [] as string[],
    };
    expect.assertions(1);
    return expectSaga(saga_exports.fetchData, fakeAxiosFn)
      .provide([
        [call(Api.axios.get, '/api/auth/refresh'), throwError(error401 as any)],
        [matchers.call.fn(saga_exports._set_logout), null],
      ])
      .withReducer(combineReducers(reducer), { api: init })
      .put(onLogout())
      .call(saga_exports._set_logout)
      .run()
      .catch((error: any) => {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(error).toBe(error401);
      });
  });
});
