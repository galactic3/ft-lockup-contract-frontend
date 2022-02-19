import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NearApp from './NearApp';

jest.mock('./services/near', () => ({
  ...jest.requireActual('./services/near'),
  connectNear: async () => {
    return {
      config: {},
      api: {
        getTokenAccountId: () => 'token.jest.testnet',
        loadAllLockups: async () => {
          return Promise.resolve([]);
        }
      },
      signedIn: false,
      signedAccountId: '',
    }
  }
}));


it('renders welcome message', async () => {
  await act(async () => {
    render(<NearApp />);
    await new Promise(process.nextTick);
  });
  const items = await screen.findAllByText(/About Page/);
  expect(items).toHaveLength(1);

  const tokenMessage = await screen.findAllByText(/token account id: /);
  expect(screen.getByText(/token.jest.testnet/)).toBeInTheDocument();
});
