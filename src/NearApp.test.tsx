import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NearApp from './NearApp';

jest.mock('./services/near', () => ({
  ...jest.requireActual('./services/near'),
  connectNear: async () => ({
    config: {},
    api: {
      loadAllLockups: async () => Promise.resolve([]),
    },
    tokenApi: {
      getContract: () => ({ contractId: 'token.jest.testnet' }),
      ftMetadata: () => ({
        spec: 'ft-1.0.0',
        name: 'Token',
        symbol: 'TOKEN',
        icon: null,
        reference: null,
        reference_hash: null,
        decimals: 6,
      }),
    },
    signedIn: false,
    signedAccountId: '',
  }),
}));

it('renders welcome message', async () => {
  await act(async () => {
    render(<NearApp />);
    await new Promise(process.nextTick);
  });
});
