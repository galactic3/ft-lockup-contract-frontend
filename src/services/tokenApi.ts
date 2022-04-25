import {
  Contract, WalletConnection,
} from 'near-api-js';
import { TCheckpoint } from './api';

const MAX_GAS = 300_000_000_000_000;
const ONE_YOKTO = 1;

const TOKEN_VIEW_METHODS = [
  'ft_metadata',
];

const TOKEN_CHANGE_METHODS = [
  'ft_transfer_call', // redirects to wallet
];

type TTokenChangeMethods = {
  'ft_transfer_call': any
};

type TTokenViewMethods = {
  'ft_metadata': any
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

  ftTransferCall(
    meta: {
      receiver_id: string,
      amount: string,
      msg: {
        account_id: string,
        schedule: TCheckpoint[],
        vesting_schedule: TCheckpoint[] | null,
        claimed_balance: string,
      },
    },
    gas = MAX_GAS,
    deposit = ONE_YOKTO,
  ): void {
    const { msg, ...rest } = meta;

    this.contract.ft_transfer_call(
      { msg: JSON.stringify(msg), ...rest },
      gas,
      deposit,
    );
  }

  ftMetadata(): Promise<TMetadata> {
    return this.contract.ft_metadata({});
  }
}

export default TokenApi;
