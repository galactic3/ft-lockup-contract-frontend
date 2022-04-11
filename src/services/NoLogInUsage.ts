import * as nearAPI from 'near-api-js';
import { config } from '../config';
import NearApi from './api';

const getFirstFullAccessKey = async (provider: any, accountId: String): Promise<any> => {
  const allAccessKeys = await provider.query({
    request_type: 'view_access_key_list',
    account_id: accountId,
    finality: 'optimistic',
  });

  if (!allAccessKeys.keys?.length) {
    return {};
  }

  const allFullAccessKeys = allAccessKeys.keys.filter((key: any) => (typeof key?.access_key?.permission === 'string') && key?.access_key?.permission === 'FullAccess');

  if (!allFullAccessKeys?.length) {
    return {};
  }

  return allFullAccessKeys[0];
};

const importWhitelistedAccountsFullAccessKeys = async () => {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const api = new NearApi(near);
  const ownerAccountIds = await api.getContract().get_deposit_whitelist() || [];
  const { provider } = near.connection;

  if (!ownerAccountIds?.length) {
    throw Error('Zero lockup owners');
  }

  await Promise.all(
    ownerAccountIds.map(async (ownerAccountId: string) => {
      const firstFullAccessKey = await getFirstFullAccessKey(provider, ownerAccountId);
      console.log('ffak = ', firstFullAccessKey);

      localStorage.setItem(
        `${config.contractName}_wallet_auth_key`,
        JSON.stringify({ accountId: ownerAccountId, allKeys: [firstFullAccessKey.public_key] }),
      );
    }),
  );

  console.log('ownerAccountIds = ', ownerAccountIds);
};

const NoLogInUsage = {
  importWhitelistedAccountsFullAccessKeys,
};

export default NoLogInUsage;
