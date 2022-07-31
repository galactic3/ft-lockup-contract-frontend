import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
import { config as configTemplate } from '../config';
import { restoreLocalStorage } from '../utils';
import NearApi from './api';
import NoLoginApi from './noLoginApi';
import NoLoginTokenApi from './NoLoginTokenApi';
import TokenApi from './tokenApi';
import FactoryApi from './factoryApi';
import { daoCouncilMembers } from './DAOs/astroDAO/utils';

export interface INearConfig {
  contractName: string,
  networkId: string,
  nodeUrl: string,
  walletUrl: string,
  helperUrl: string,
  explorerUrl: string,
  factoryContractName: string,
}

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  noLoginApi: NoLoginApi
  currentUser: {
    signedIn: boolean;
    isAdmin: boolean;
    isDraftOperator: boolean;
    isCouncilMember: boolean;
    signedAccountId: string | null;
    daos: string[];
  }
  tokenContractId: string;
  lockupContractId: string;
  lockupContractFound: boolean;
  lockupContractNone: boolean;
  tokenApi: TokenApi;
  noLoginTokenApi: NoLoginTokenApi;
  factoryApi: FactoryApi;
  rpcProvider: nearAPI.providers.JsonRpcProvider;
  isContractFtStoragePaid: boolean;
  near: nearAPI.Near;
  suggestConvertDialog: {
    open: boolean,
    setOpen: (newValue: boolean) => any,
  }
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  if (localStorage.getItem('dump')) {
    restoreLocalStorage();
  }

  let lockupContractId = window.location.hash.split('/')[1] || '';
  if (['', 'terms', 'privacy', 'about', 'new_lockup_contract'].some((x) => lockupContractId === x)) {
    lockupContractId = 'lockup_contract_none';
  }
  debugger;
  const config: INearConfig = { ...configTemplate, contractName: lockupContractId };

  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const api = new NearApi(near);

  const noLoginKeyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const noLoginNear = await nearAPI.connect({ headers: {}, keyStore: noLoginKeyStore, ...config });
  const noLoginApi = new NoLoginApi(noLoginNear);
  const noLoginTokenApi = new NoLoginTokenApi(noLoginNear);

  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const signedAccountId = walletConnection.getAccountId();
  let tokenContractId: string = 'lockup_contract_not_found';
  let isAdmin: boolean = false;
  let isDraftOperator: boolean = false;
  let depositWhitelist: string[] = [];
  let draftOperatorsWhitelist: string[] = [];
  let daos: string[] = [];
  let lockupContractFound = false;
  try {
    tokenContractId = await api.getTokenAccountId();
    depositWhitelist = await api.getDepositWhitelist();
    draftOperatorsWhitelist = await api.getDraftOperatorsWhitelist();
    console.log('depositWhitelist', depositWhitelist);
    isAdmin = depositWhitelist.includes(signedAccountId);
    console.log('isAdmin', isAdmin);
    isDraftOperator = draftOperatorsWhitelist.includes(signedAccountId);
    console.log('isDraftOperator', isDraftOperator);
    const dcm = daoCouncilMembers;
    console.log(dcm);
    const daosCouncilMembers = (await Promise.all(depositWhitelist.map((dwID): Promise<any[]> => daoCouncilMembers(walletConnection, dwID)))).filter((value) => !!value);
    console.log(daosCouncilMembers);
    const userDaosCouncils = daosCouncilMembers.filter((daoCMs) => Object.values(daoCMs).pop().includes(signedAccountId));
    if (userDaosCouncils?.length > 0) {
      daos = userDaosCouncils.map((daoCMs) => Object.keys(daoCMs).pop() || '');
    }
    console.log('userDaosCouncils', userDaosCouncils);
    console.log('councilMembers', daosCouncilMembers);
    console.log('daos', daos);
  } catch (e) {
    console.log(e);
    const nearConnectionError: any = e;
    if (nearConnectionError.type === 'AccountDoesNotExist') {
      console.log('contract not found');
    } else {
      console.log(`UNKNOWN ERROR: ${e}`);
    }
  }
  const tokenApi = new TokenApi(walletConnection, tokenContractId);

  let isContractFtStoragePaid = false;

  try {
    const storageBalance = await tokenApi.storageBalanceOf(lockupContractId);
    // successful read of data from token contract AND lockup contract
    lockupContractFound = true;
    isContractFtStoragePaid = (storageBalance !== null) && true;
    console.log(isContractFtStoragePaid);
  } catch (e) {
    console.log(e);
  }

  const factoryApi = new FactoryApi(
    walletConnection,
    config.factoryContractName,
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
      isDraftOperator,
      isCouncilMember: daos.length > 0,
      signedAccountId,
      daos,
    },
    noLoginTokenApi,
    rpcProvider,
    isContractFtStoragePaid,
    lockupContractId,
    lockupContractFound,
    lockupContractNone: lockupContractId === 'lockup_contract_none',
    near,
    suggestConvertDialog: {
      open: false,
      setOpen: () => null,
    },
  };
};
