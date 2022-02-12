import {
  Near, Account, Contract, WalletConnection, utils,
} from 'near-api-js';
import { config } from '../config';

export const fromNear = (amount: string): number => parseFloat(utils.format.formatNearAmount(amount || '0'));
export const toYoctoNear = (amount: number): string => utils.format.parseNearAmount(String(amount)) || '0';

class NearApi {
  readonly near: Near;

  readonly contract: Contract;

  readonly walletConnection: WalletConnection;

  constructor(near: Near) {
    this.near = near;
    this.walletConnection = new WalletConnection(near, config.contractName);
    this.contract = new Contract(this.walletConnection.account(), config.contractName, {
      viewMethods: [],
      changeMethods: [],
    });
  }

  signIn(): void {
    const successUrl = window.location.href;
    this.walletConnection.requestSignIn(config.contractName, undefined, successUrl);
  }

  signOut(): void {
    this.walletConnection.signOut();
  }

  async get_account_id(): Promise<string> {
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
