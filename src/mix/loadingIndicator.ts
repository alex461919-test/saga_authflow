import { message } from 'antd';
import debounce from 'lodash.debounce';
import { useEffect } from 'react';
import { ReduxStore } from '../store';

export const useLoadingIndicator = (store: ReduxStore) => {
  useEffect(() => {
    let msg: any = null;
    const hide = () => {
      msg && msg();
      msg = null;
    };
    const listener = () => {
      const processes = store.getState().api.fetchProcess;
      if (processes.length > 0 && !msg)
        msg = message.open({
          content: 'Fetch in progress..',
          type: 'loading',
          duration: 0,
          style: { width: 'fit-content', margin: '0 8px 0 auto' },
        });

      if (processes.length === 0) hide();
    };
    const unsubscribe = store.subscribe(debounce(listener, 50));
    return () => {
      hide();
      unsubscribe();
    };
  }, [store]);
};
