import React from 'react';
import './App.scss';
import Auth from './Auth';
import { useAppStore } from './store';
import { useLoadingIndicator } from './mix/loadingIndicator';

function App() {
  const store = useAppStore();
  useLoadingIndicator(store);
  return (
    <div className="App">
      <Auth />
    </div>
  );
}

export default App;
