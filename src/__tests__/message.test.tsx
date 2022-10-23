/* eslint-disable testing-library/no-debugging-utils */
import { render, screen } from '@testing-library/react';
import { message } from 'antd';
import React from 'react';

test('message', async () => {
  const { debug } = render(<></>);
  const hide = message.open({ content: 'success', type: 'success' });
  expect(await screen.findByText('success')).toBeInTheDocument();
  hide();
  expect(screen.queryByText('success')).not.toBeInTheDocument();
});
