import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useStore } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import createApi from './api';
import { apiReducer } from './reducers';
import rootSaga from './saga';

export const reducer = { api: apiReducer };

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

export type ReduxStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;

// Этого не надо, тк не используем thunk
//export type RootState = StateFromReducersMapObject<typeof reducer>;
//export type AppDispatch = typeof store.dispatch;
//export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => ReduxStore = useStore;

export const useAuthState = () => useAppSelector((state) => state.api.auth);
export const useProfile = () => useAppSelector((state) => state.api.auth.profile);
export const useFetchProcess = () => useAppSelector((state) => state.api.fetchProcess);

export const Api = createApi(store);

sagaMiddleware.run(rootSaga);
