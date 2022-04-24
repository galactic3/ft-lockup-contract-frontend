import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
import { config, INearConfig } from '../config';
import { restoreLocalStorage } from '../utils';
import NearApi from './api';
import NoLoginApi from './noLoginApi';
import TokenApi from './tokenApi';

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  noLoginApi: NoLoginApi
  signedIn: boolean;
  isAdmin: boolean;
  signedAccountId: string | null;
  tokenApi: TokenApi;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  restoreLocalStorage();

  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const api = new NearApi(near);

  const noLoginKeyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const noLoginNear = await nearAPI.connect({ headers: {}, keyStore: noLoginKeyStore, ...config });
  const noLoginApi = new NoLoginApi(noLoginNear);

  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const signedAccountId = walletConnection.getAccountId();
  const tokenContractId = await api.getTokenAccountId();
  const depositWhitelist = await api.getDepositWhitelist();
  const isAdmin = depositWhitelist.includes(signedAccountId);
  const tokenApi = new TokenApi(walletConnection, tokenContractId);

  return {
    config,
    api,
    noLoginApi,
    signedIn: !!signedAccountId,
    isAdmin,
    signedAccountId,
    tokenApi,
  };
};
