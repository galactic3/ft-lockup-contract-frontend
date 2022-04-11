import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
// import { AccessKeyInfoView } from 'near-api-js/providers/provider';
import { config, INearConfig } from '../config';
import NearApi from './api';

const SENDER = 'owner.demo000.ft-lockup.testnet';

const getFirstFullAccessKey = async (provider: any, accountId: String): Promise<any> => {
  const allAccessKeys = await provider.query({
    request_type: 'view_access_key_list',
    account_id: accountId,
    finality: 'optimistic',
  });

  if (!allAccessKeys.keys?.length) {
    return {};
  }

  // nearAPI.providers.Provider['AccessKeyInfoView']

  const allFullAccessKeys = allAccessKeys.keys.filter((key: any) => (typeof key?.access_key?.permission === 'string') && key?.access_key?.permission === 'FullAccess');

  if (!allFullAccessKeys?.length) {
    return {};
  }

  return allFullAccessKeys[0];
};

export interface INearProps {
  config: INearConfig;
  api: NearApi;
  signedIn: boolean;
  signedAccountId: string | null;
  firstFullAccessKey: nearAPI.transactions.AccessKey
  walletConnection: nearAPI.WalletConnection;
  contract: any;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const api = new NearApi(near);
  const signedAccountId = walletConnection.getAccountId();
  const firstFullAccessKey = await getFirstFullAccessKey(near.connection.provider, SENDER);
  const tokenContractId = await api.getTokenAccountId();
  api.setTokenContract(tokenContractId);

  localStorage.setItem(
    'undefined_wallet_auth_key',
    JSON.stringify({ accountId: SENDER, allKeys: [firstFullAccessKey.public_key] }),
  );

  const contract = await new nearAPI.Contract(
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
    firstFullAccessKey,
    walletConnection,
    contract,
  };
};
