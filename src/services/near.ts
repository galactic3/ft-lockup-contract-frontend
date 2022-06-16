import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
import { config, INearConfig } from '../config';
import { restoreLocalStorage } from '../utils';
import NearApi from './api';
import NoLoginApi from './noLoginApi';
import NoLoginTokenApi from './NoLoginTokenApi';
import TokenApi from './tokenApi';
import FactoryApi from './factoryApi';
import { daoCouncilMembers } from './DAOs/astroDAO/utils';

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  noLoginApi: NoLoginApi
  currentUser: {
    signedIn: boolean;
    isAdmin: boolean;
    isCouncilMember: boolean;
    signedAccountId: string | null;
    daos: string[];
  }
  tokenContractId: string;
  lockupContractId: string;
  tokenApi: TokenApi;
  noLoginTokenApi: NoLoginTokenApi;
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
  const noLoginTokenApi = new NoLoginTokenApi(noLoginNear);

  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const signedAccountId = walletConnection.getAccountId();
  let tokenContractId: string = '';
  let isAdmin: boolean = false;
  let depositWhitelist: string[] = [];
  let daos: string[] = [];
  try {
    tokenContractId = await api.getTokenAccountId();
    depositWhitelist = await api.getDepositWhitelist();
    console.log('depositWhitelist', depositWhitelist);
    isAdmin = depositWhitelist.includes(signedAccountId);
    console.log('isAdmin', isAdmin);
    const daosCouncilMembers = (await Promise.all(depositWhitelist.map((dwID):Promise<any[]> => daoCouncilMembers(near, dwID)))).filter((value) => !!value);
    const userDaosCouncils = daosCouncilMembers.filter((daoCMs) => Object.values(daoCMs).pop().includes(signedAccountId));
    if (userDaosCouncils?.length > 0) {
      daos = userDaosCouncils.map((daoCMs) => Object.keys(daoCMs).pop() || '');
    }
    console.log('userDaosCouncils', userDaosCouncils);
    console.log('councilMembers', daosCouncilMembers);
    console.log('daos', daos);
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
    tokenApi,
    factoryApi,
    currentUser: {
      signedIn: !!signedAccountId,
      isAdmin,
      isCouncilMember: daos.length > 0,
      signedAccountId,
      daos,
    },
    noLoginTokenApi,
    rpcProvider,
    isContractFtStoragePaid,
    lockupContractId,
  };
};
