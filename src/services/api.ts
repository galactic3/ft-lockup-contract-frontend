import {
  Near, Account, Contract, WalletConnection, utils,
} from 'near-api-js';
import { MAX_GAS } from '../utils';

export const fromNear = (amount: string): number => parseFloat(utils.format.formatNearAmount(amount || '0'));
export const toYoctoNear = (amount: number): string => utils.format.parseNearAmount(String(amount)) || '0';

const LOCKUP_VIEW_METHODS = [
  'get_lockups_paged',
  'get_token_account_id',
  'get_deposit_whitelist',
];

const LOCKUP_CHANGE_METHODS = [
  'claim',
  'terminate',
];

type TViewMethods = {
  'get_lockups_paged': any,
  'get_token_account_id': any,
  'get_deposit_whitelist': any,
};

type TChangeMethods = {
  'claim': any,
  'terminate': any,
};

type TNearAmount = string;
type TNearTimestamp = number;

export type TCheckpoint = {
  timestamp: TNearTimestamp,
  balance: TNearAmount,
};

export type TLockup = {
  id: number,
  account_id: string,
  claimed_balance: TNearAmount,
  schedule: TCheckpoint[],
  timestamp: TNearTimestamp,
  total_balance: TNearAmount,
  unclaimed_balance: TNearAmount,
};

export type TLockupContract = Contract & TViewMethods & TChangeMethods;

class NearApi {
  private near: Near;

  private contract: Contract;

  private walletConnection: WalletConnection;

  constructor(near: Near) {
    this.near = near;
    this.walletConnection = new WalletConnection(near, this.near.config.contractName);
    this.contract = new Contract(
      this.walletConnection.account(),
      this.near.config.contractName,
      { viewMethods: LOCKUP_VIEW_METHODS, changeMethods: LOCKUP_CHANGE_METHODS },
    );
  }

  async terminate(lockupIndex: number): Promise<void> {
    try {
      await (this.contract as TLockupContract).terminate(
        { lockup_index: lockupIndex },
        MAX_GAS,
      );
    } catch (e) {
      throw Error('Cannot terminate lockup more than once');
    }
  }

  getNear(): Near {
    return this.near;
  }

  getContract(): TLockupContract {
    return this.contract as TLockupContract;
  }

  getTokenAccountId(): Promise<string> {
    return (this.contract as TLockupContract).get_token_account_id();
  }

  getDepositWhitelist(): Promise<Array<string>> {
    return (this.contract as TLockupContract).get_deposit_whitelist();
  }

  loadAllLockups(): Promise<TLockup[]> {
    return (this.contract as TLockupContract).get_lockups_paged().then(
      (response: any) => response.map(([id, data]: [number, any]) => Object.assign(data, { id })),
    );
  }

  signIn(): void {
    const successUrl = `${window.location.href}`;
    this.walletConnection.requestSignIn(this.near.config.contractName, undefined, successUrl);
  }

  signOut(): void {
    this.walletConnection.signOut();
    this.near.config.keyStore.clear();
  }

  get_account_id(): string {
    return this.walletConnection.getAccountId();
  }

  async account(acc_id: string): Promise<Account> {
    return this.near.account(acc_id);
  }

  async get_balance(acc_id: string): Promise<number | null> {
    const account = await this.account(acc_id);
    let balance = null;
    try {
      const b = await account.getAccountBalance();
      balance = fromNear(b.total);
    } catch (e) {
      console.error('Account not exist');
    }
    return balance;
  }
}

export default NearApi;
