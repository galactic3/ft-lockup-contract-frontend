import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
import { config, INearConfig } from '../config';
import NearApi from './api';
import NoLogInUsage from './NoLogInUsage';

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  signedIn: boolean;
  signedAccountId: string | null;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  await NoLogInUsage.importWhitelistedAccountsFullAccessKeys();

  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const api = new NearApi(near);
  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const signedAccountId = walletConnection.getAccountId();
  const tokenContractId = await api.getTokenAccountId();
  api.setTokenContract(tokenContractId);

  return {
    config,
    api,
    signedIn: !!signedAccountId,
    signedAccountId,
  };
};
