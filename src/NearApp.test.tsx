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
        loadAllLockups: async () => {
          return Promise.resolve([]);
        }
      },
      tokenApi: {
        getContract: () => { return { contractId: 'token.jest.testnet'} },
        ftMetadata: () => { return {
          spec: 'ft-1.0.0',
          name: 'Token',
          symbol: 'TOKEN',
          icon: null,
          reference: null,
          reference_hash: null,
          decimals: 6
        } },
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
  const progressItem= await screen.findAllByText(/Progress/);
  expect(progressItem).toHaveLength(1);
});
