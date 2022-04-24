import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
import { config, INearConfig } from '../config';
import NearApi from './api';
import TokenApi from './tokenApi';

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  signedIn: boolean;
  isAdmin: boolean;
  signedAccountId: string | null;
  tokenApi: TokenApi;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const api = new NearApi(near);
  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const signedAccountId = walletConnection.getAccountId();
  const tokenContractId = await api.getTokenAccountId();
  const depositWhitelist = await api.getDepositWhitelist();
  const isAdmin = depositWhitelist.includes(signedAccountId);
  const tokenApi = new TokenApi(walletConnection, tokenContractId);

  return {
    config,
    api,
    signedIn: !!signedAccountId,
    isAdmin,
    signedAccountId,
    tokenApi,
  };
};
