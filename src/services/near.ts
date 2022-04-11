import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
// import { AccessKeyInfoView } from 'near-api-js/providers/provider';
import { config, INearConfig } from '../config';
import NearApi from './api';

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  signedIn: boolean;
  signedAccountId: string | null;
  walletConnection: nearAPI.WalletConnection;
  contract: any;
  provider: any;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const api = new NearApi(near);
  const signedAccountId = walletConnection.getAccountId();
  const tokenContractId = await api.getTokenAccountId();
  api.setTokenContract(tokenContractId);
  const { provider } = near.connection;

  console.log('sender accountId = ', walletConnection.getAccountId());

  const contract = new nearAPI.Contract(
    walletConnection.account(),
    config.contractName,
    {
      viewMethods: ['get_lockups_paged'],
      changeMethods: ['new_unlocked'],
    },
  );

  return {
    config,
    api,
    signedIn: !!signedAccountId,
    signedAccountId,
    walletConnection,
    contract,
    provider,
  };
};
