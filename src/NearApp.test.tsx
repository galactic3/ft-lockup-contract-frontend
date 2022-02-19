import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NearApp from './NearApp';

it('renders welcome message', async () => {
  await act(async () => {
    render(<NearApp />);
    await new Promise(process.nextTick);
  });
  const items = await screen.findAllByText(/About Page/);
  expect(items).toHaveLength(1);
});
