import {
  Contract, WalletConnection,
} from 'near-api-js';
import { TSchedule, TNearAmount } from './api';

const MAX_GAS = 300_000_000_000_000;
const ONE_YOKTO = 1;

const TOKEN_VIEW_METHODS = [
  'ft_metadata',
  'storage_balance_of',
  'storage_balance_bounds',
];

const TOKEN_CHANGE_METHODS = [
  'ft_transfer_call', // redirects to wallet
  'storage_deposit',
];

type TTokenChangeMethods = {
  'ft_transfer_call': any,
  'storage_deposit': any,
};

type TTokenViewMethods = {
  'ft_metadata': any,
  'storage_balance_of': any,
  'storage_balance_bounds': any,
};

export type TMetadata = {
  spec: string,
  name: string,
  symbol: string,
  icon: string | null,
  reference: string | null,
  reference_hash: string | null,
  decimals: number,
};

type TTerminationConfig = {
  payer_id: string,
  vesting_schedule: {
    Schedule: TSchedule,
  },
};

type TLockupCreate = {
  account_id: string,
  schedule: TSchedule,
  termination_config: TTerminationConfig | null,
  claimed_balance: TNearAmount,
};

type TDraftGroupFund = {
  draft_group_id: number,
};

type TTokenContract = Contract & TTokenChangeMethods & TTokenViewMethods;

class TokenApi {
  private contract: TTokenContract;

  constructor(walletConnection: WalletConnection, contractId: string) {
    this.contract = new Contract(
      walletConnection.account(),
      contractId,
      { viewMethods: TOKEN_VIEW_METHODS, changeMethods: TOKEN_CHANGE_METHODS },
    ) as TTokenContract;
  }

  getContract(): TTokenContract {
    return this.contract;
  }

  async createLockup(
    lockupContractId: string,
    lockupTotalAmount: string,
    userAccountId: string,
    lockupSchedule: any[],
    terminationConfig: TTerminationConfig | null,
    claimedBalance: string = '0',
  ): Promise<void> {
    const result = await this.ftTransferCall({
      receiver_id: lockupContractId,
      amount: lockupTotalAmount.toString(),
      msg: {
        account_id: userAccountId,
        schedule: lockupSchedule,
        termination_config: terminationConfig,
        claimed_balance: claimedBalance,
      },
    });

    return result;
  }

  async fundDraftGroup(lockupContractId: string, draftGroupId: number, amount: string): Promise<void> {
    const result = await this.ftTransferCall({
      receiver_id: lockupContractId,
      amount,
      msg: {
        draft_group_id: draftGroupId,
      },
    });

    return result;
  }

  async ftTransferCall(
    meta: {
      receiver_id: string,
      amount: string,
      msg: TLockupCreate | TDraftGroupFund,
    },
    gas = MAX_GAS,
    deposit = ONE_YOKTO,
  ): Promise<void> {
    const { msg, ...rest } = meta;

    await this.contract.ft_transfer_call(
      { msg: JSON.stringify(msg), ...rest },
      gas,
      deposit,
    );
  }

  storageDeposit(accountId: String, amount: String): Promise<any> {
    return this.contract.storage_deposit({
      args: { account_id: accountId },
      gas: MAX_GAS,
      amount,
    });
  }

  ftMetadata(): Promise<TMetadata> {
    return this.contract.ft_metadata({});
  }

  storageBalanceOf(accountId: String): Promise<String> {
    return this.contract.storage_balance_of({ account_id: accountId });
  }

  storageBalanceBounds(): Promise<{ min: string, max: string }> {
    return this.contract.storage_balance_bounds();
  }
}

export default TokenApi;
