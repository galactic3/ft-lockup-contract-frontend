const getFirstFullAccessKey = async (provider: any, accountId: String): Promise<any> => {
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

export default getFirstFullAccessKey;
