import React, { PropsWithChildren } from 'react';
import { render as rtlRender, renderHook, RenderOptions, screen, waitFor } from '@testing-library/react';
import { reducer, ReduxStore } from '../store';
import { Provider } from 'react-redux';
import { configureStore, Store } from '@reduxjs/toolkit';
import { addFetchProcess, removeFetchProcess } from '../store/reducers';

import { message } from 'antd';
import { useLoadingIndicator } from '../mix/loadingIndicator';

//jest.mock('antd');
/*, () => {
  return { message: { open: jest.fn() } };
});*/
/*
function render(ui: React.ReactElement, { store, ...renderOptions }: RenderOptions & { store: ReduxStore }) {
  function wrapper({ children }: PropsWithChildren<{}>) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper, ...renderOptions });
}
*/
function render<T extends Store>(ui: React.ReactElement, { store, ...renderOptions }: RenderOptions & { store: T }) {
  function wrapper({ children }: PropsWithChildren<{}>) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper, ...renderOptions });
}

describe('Тестируем окошко со spinner', () => {
  let store: ReduxStore;
  const fetchProcesses = () => store.getState().api.fetchProcess;
  const delay = (time: number) => new Promise((r) => setTimeout(r, time));
  beforeEach(() => {
    store = configureStore({ reducer });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('После размонирования элемента с хуком нужно отписаться от store', async () => {
    const unsubscribeMock = jest.fn();
    const subscribeSpy = jest.spyOn(store, 'subscribe').mockImplementation(() => unsubscribeMock);
    const { unmount } = renderHook(() => useLoadingIndicator(store));
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    unmount();
    await waitFor(() => expect(unsubscribeMock).toHaveBeenCalledTimes(1));
    subscribeSpy.mockRestore();
  });

  test('Добавляем/убавляем fetch процессы.', async () => {
    expect(fetchProcesses()).toEqual([]);

    store.dispatch(addFetchProcess('1'));
    expect(fetchProcesses()).toEqual(['1']);

    store.dispatch(addFetchProcess('2'));
    expect(fetchProcesses()).toEqual(['1', '2']);

    store.dispatch(addFetchProcess('3'));
    expect(fetchProcesses()).toEqual(['1', '2', '3']);

    store.dispatch(removeFetchProcess('2'));
    expect(fetchProcesses()).toEqual(['1', '3']);

    store.dispatch(removeFetchProcess('3'));
    expect(fetchProcesses()).toEqual(['1']);

    store.dispatch(removeFetchProcess('1'));
    expect(fetchProcesses()).toEqual([]);
  });
  test('Проверяем debounce 50ms. Без задержки 2 события. Должно сработать 1 раз', async () => {
    const openSpy = jest.spyOn(message, 'open');
    renderHook(() => useLoadingIndicator(store));
    store.dispatch(addFetchProcess('1'));
    await delay(20);
    store.dispatch(addFetchProcess('2'));
    expect(openSpy).toHaveBeenCalledTimes(0);
    await delay(80);
    expect(openSpy).toHaveBeenCalledTimes(1);
    openSpy.mockRestore();
  });

  test('Проверяем debounce 50ms. С задержкой 60ms 2 события. Должно сработать 2 раза', async () => {
    const openSpy = jest.spyOn(message, 'open');
    renderHook(() => useLoadingIndicator(store));
    store.dispatch(addFetchProcess('1'));
    expect(openSpy).toHaveBeenCalledTimes(0);
    await delay(80);
    expect(openSpy).toHaveBeenCalledTimes(1);
    store.dispatch(removeFetchProcess('1'));
    await delay(80);
    expect(openSpy).toHaveBeenCalledTimes(1);
    store.dispatch(addFetchProcess('1'));
    await delay(80);
    expect(openSpy).toHaveBeenCalledTimes(2);
    openSpy.mockRestore();
  });
});
