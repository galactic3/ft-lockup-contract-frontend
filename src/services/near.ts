import * as nearAPI from 'near-api-js';
import { createContext } from 'react';
// import { AccessKeyInfoView } from 'near-api-js/providers/provider';
import { config, INearConfig } from '../config';
import NearApi from './api';

const SENDER = 'backail_bidder.testnet';

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
  walletConnection: nearAPI.WalletConnection;
}

export const NearContext = createContext<any>(null);

export const connectNear = async (): Promise<INearProps> => {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const api = new NearApi(near);
  const signedAccountId = walletConnection.getAccountId();
  const firstFullAccessKey = await getFirstFullAccessKey(near.connection.provider, SENDER);
  localStorage.setItem(
    'undefined_wallet_auth_key',
    JSON.stringify({ accountId: SENDER, allKeys: [firstFullAccessKey.public_key] }),
  );

  return {
    config,
    api,
    signedIn: !!signedAccountId,
    signedAccountId,
    walletConnection,
  };
};
