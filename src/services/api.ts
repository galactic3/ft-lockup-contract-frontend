import {
  Near, Account, Contract, WalletConnection, utils,
} from 'near-api-js';
import { config } from '../config';

export const fromNear = (amount: string): number => parseFloat(utils.format.formatNearAmount(amount || '0'));
export const toYoctoNear = (amount: number): string => utils.format.parseNearAmount(String(amount)) || '0';

type TViewMethods = {
  'get_lockups_paged': any,
  'get_token_account_id': any,
};

class NearApi {
  private near: Near;

  private contract: Contract;

  private walletConnection: WalletConnection;

  constructor(near: Near) {
    this.near = near;
    this.walletConnection = new WalletConnection(near, config.contractName);
    this.contract = new Contract(this.walletConnection.account(), config.contractName, {
      viewMethods: ['get_lockups_paged', 'get_token_account_id'],
      changeMethods: [],
    });
  }

  getTokenAccountId(): Promise<string> {
    return (this.contract as Contract & TViewMethods).get_token_account_id();
  }

  loadAllLockups(): Promise<any[]> {
    return (this.contract as Contract & TViewMethods).get_lockups_paged().then(
      (response: any) => response.map(([id, data]: [number, any]) => Object.assign(data, { id })),
    );
  }

  signIn(): void {
    const successUrl = window.location.href;
    this.walletConnection.requestSignIn(config.contractName, undefined, successUrl);
  }

  signOut(): void {
    this.walletConnection.signOut();
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
