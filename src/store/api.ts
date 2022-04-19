import axios from 'axios';
import { ReduxStore } from '.';
import { addFetchProcess, removeFetchProcess } from './reducers';

const createApi = ({ getState, dispatch }: ReduxStore) => {
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 15000,
    //headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json'},
  });

  axiosInstance.interceptors.request.use(
    function (config) {
      const token = getState().api.auth.token;
      if (token) config.headers = { ...config.headers, Authorization: token };
      const requestId = (Math.random() + 1).toString(36).substring(2);
      Object.defineProperty(config, 'requestId', { value: requestId });
      dispatch(addFetchProcess(requestId));
      if (config.signal) {
        config.signal.onabort = () => dispatch(removeFetchProcess(requestId));
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    function (response) {
      const requestId = Object.getOwnPropertyDescriptor(response.config, 'requestId')?.value;
      requestId && dispatch(removeFetchProcess(requestId));
      return response;
    },
    function (error) {
      const requestId = Object.getOwnPropertyDescriptor(error.response.config, 'requestId')?.value;
      requestId && dispatch(removeFetchProcess(requestId));
      return Promise.reject(error);
    }
  );

  return {
    axios: axiosInstance,
    saveToken(token: string) {
      console.log('API save token: ', token);
      token && localStorage.setItem('auth_token', token);
    },
    getToken(): string | null {
      return localStorage.getItem('auth_token');
    },
    removeToken() {
      localStorage.removeItem('auth_token');
    },
  };
};

export default createApi;
