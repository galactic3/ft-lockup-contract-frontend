import {
  Near, Contract, WalletConnection,
} from 'near-api-js';
import { MAX_GAS, dumpLocalStorage } from '../utils';
import getFirstFullAccessKey from './noLogInUsage';

const LOCKUP_VIEW_METHODS = [''];
const LOCKUP_CHANGE_METHODS = ['claim'];

type TChangeMethods = {
  'claim': any,
};

type TLockupContract = Contract & TChangeMethods;

class NoLoginApi {
  private near: Near;

  constructor(near: Near) {
    this.near = near;
  }

  async claim(accountId: string): Promise<void> {
    dumpLocalStorage();

    await this.setWalletAndContractWithAuth(accountId);

    await this.buildContract().claim({}, MAX_GAS);

    this.near.config.keyStore.clean();
  }

  async claimSpecificLockups(accountId: string, lockupIds: number[]): Promise<void> {
    dumpLocalStorage();

    await this.setWalletAndContractWithAuth(accountId);

    await this.buildContract().claim({ amounts: lockupIds.map((x) => [x, null]) }, MAX_GAS);

    this.near.config.keyStore.clean();
  }

  async setWalletAndContractWithAuth(
    accountId: string,
    contractName: string = this.near.config.contractName,
  ): Promise<any> {
    const firstFullAccessKey = await getFirstFullAccessKey(
      this.near.connection.provider,
      accountId,
    );

    localStorage.setItem(
      `${contractName}_wallet_auth_key`,
      JSON.stringify({ accountId, allKeys: [firstFullAccessKey.public_key] }),
    );
  }

  buildContract(): TLockupContract {
    return new Contract(
      (new WalletConnection(this.near, this.near.config.contractName)).account(),
      this.near.config.contractName,
      { viewMethods: LOCKUP_VIEW_METHODS, changeMethods: LOCKUP_CHANGE_METHODS },
    ) as TLockupContract;
  }
}

export default NoLoginApi;
