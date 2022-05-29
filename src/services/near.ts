import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
import { config, INearConfig } from '../config';
import { restoreLocalStorage } from '../utils';
import NearApi from './api';
import NoLoginApi from './noLoginApi';
import TokenApi from './tokenApi';
import FactoryApi from './factoryApi';

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  noLoginApi: NoLoginApi
  signedIn: boolean;
  isAdmin: boolean;
  signedAccountId: string | null;
  tokenContractId: string;
  lockupContractId: string;
  tokenApi: TokenApi;
  factoryApi: FactoryApi;
  rpcProvider: nearAPI.providers.JsonRpcProvider;
  isContractFtStoragePaid: boolean;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  if (localStorage.getItem('dump')) {
    restoreLocalStorage();
  }

  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const api = new NearApi(near);

  const noLoginKeyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const noLoginNear = await nearAPI.connect({ headers: {}, keyStore: noLoginKeyStore, ...config });
  const noLoginApi = new NoLoginApi(noLoginNear);

  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const signedAccountId = walletConnection.getAccountId();
  let tokenContractId: string = '';
  let isAdmin: boolean = false;
  try {
    tokenContractId = await api.getTokenAccountId();
    const depositWhitelist = await api.getDepositWhitelist();
    isAdmin = depositWhitelist.includes(signedAccountId);
  } catch (e) {
    console.log(e);
  }
  const tokenApi = new TokenApi(walletConnection, tokenContractId);

  let isContractFtStoragePaid = false;
  const lockupContractId = window.location.hash.split('/')[1];

  try {
    const storageBalance = await tokenApi.storageBalanceOf(lockupContractId);
    isContractFtStoragePaid = (storageBalance !== null) && true;
    console.log(isContractFtStoragePaid);
  } catch (e) {
    console.log(e);
  }

  const factoryApi = new FactoryApi(
    walletConnection,
    config.factoryContractName,
    config.factoryContractHash,
  );

  const rpcProvider = new nearAPI.providers.JsonRpcProvider(
    config.nodeUrl,
  );

  return {
    config,
    api,
    tokenContractId,
    noLoginApi,
    signedIn: !!signedAccountId,
    isAdmin,
    signedAccountId,
    tokenApi,
    factoryApi,
    rpcProvider,
    isContractFtStoragePaid,
    lockupContractId,
  };
};
