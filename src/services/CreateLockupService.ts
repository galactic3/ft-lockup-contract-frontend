import {
  TTokenContract, TCheckpoint,
} from './api';

const MAX_GAS = 300_000_000_000_000;
const ONE_YOKTO = 1;

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

type TLockupMessage = {
  account_id: string,
  schedule: Array<TCheckpoint>,
  claimed_balance: string,
};

class CreateLockupService {
  private lockupContractId: string;

  private tokenContract: TTokenContract;

  private schedule: Array<TCheckpoint>;

  private lockupTotalAmount: string;

  private userAccountId: string;

  private senderAccountId: string;

  private claimedBalance: string;

  private provider: any;

  constructor(
    tokenContract: TTokenContract,
    schedule: Array<TCheckpoint>,
    lockupContractId: string,
    userAccountId: string,
    senderAccountId: string,
    lockupTotalAmount: string,
    claimedBalance: string,
    provider: any,
  ) {
    this.tokenContract = tokenContract;
    this.schedule = schedule;
    this.lockupContractId = lockupContractId;
    this.userAccountId = userAccountId;
    this.senderAccountId = senderAccountId;
    this.lockupTotalAmount = lockupTotalAmount;
    this.claimedBalance = claimedBalance;
    this.provider = provider;
  }

  async call() {
    const firstFullAccessKey = await getFirstFullAccessKey(this.provider, this.senderAccountId);
    localStorage.setItem(
      `${this.lockupContractId}_wallet_auth_key`,
      JSON.stringify({ accountId: this.senderAccountId, allKeys: [firstFullAccessKey.public_key] }),
    );

    const msg: TLockupMessage = {
      account_id: this.userAccountId,
      schedule: this.schedule,
      claimed_balance: this.claimedBalance,
    };

    const meta = {
      receiver_id: this.lockupContractId,
      amount: this.lockupTotalAmount,
      msg: JSON.stringify(msg),
    };

    await this.tokenContract.ft_transfer_call(meta, MAX_GAS, ONE_YOKTO);
  }
}

export default CreateLockupService;
