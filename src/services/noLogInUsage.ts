import * as nearAPI from 'near-api-js';
import { config } from '../config';

type TViewMethods = {
  'get_deposit_whitelist': any,
};

export const getFirstFullAccessKey = async (provider: any, accountId: String): Promise<any> => {
  const allAccessKeys = await provider.query({
    request_type: 'view_access_key_list',
    account_id: accountId,
    finality: 'optimistic',
  });

  if (!allAccessKeys.keys?.length) {
    throw Error('None of access keys was founded');
  }

  const allFullAccessKeys = allAccessKeys.keys.filter((key: any) => (typeof key?.access_key?.permission === 'string') && key?.access_key?.permission === 'FullAccess');

  if (!allFullAccessKeys?.length) {
    throw Error('None of full access keys was founded');
  }

  return allFullAccessKeys[0];
};

export const importWhitelistedAccountsFullAccessKeys = async () => {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ headers: {}, keyStore, ...config });
  const walletConnection = new nearAPI.WalletConnection(near, config.contractName);
  const contract = new nearAPI.Contract(walletConnection.account(), config.contractName, {
    viewMethods: ['get_deposit_whitelist'],
    changeMethods: [],
  }) as (nearAPI.Contract & TViewMethods);
  const ownerAccountIds = await contract.get_deposit_whitelist() || [];

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
