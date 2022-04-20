import React, { useEffect } from 'react';
import debounce from 'lodash.debounce';
import './App.scss';
import Auth from './Auth';
import { ReduxStore, useAppStore } from './store';
import { message } from 'antd';
import { useLoadingIndicator } from './mix/loadingIndicator';

function App() {
  const store = useAppStore();
  console.dir(store);
  useLoadingIndicator(store);
  return (
    <div className="App">
      <Auth />
    </div>
  );
}

export default App;
