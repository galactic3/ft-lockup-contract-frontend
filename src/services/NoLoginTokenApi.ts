import {
  Near, Contract, WalletConnection,
} from 'near-api-js';
import { MAX_GAS, dumpLocalStorage } from '../utils';
import getFirstFullAccessKey from './noLogInUsage';

const TOKEN_VIEW_METHODS = [''];
const TOKEN_CHANGE_METHODS = ['storage_deposit'];

type TChangeMethods = {
  'storage_deposit': any,
};

type TTokenContract = Contract & TChangeMethods;

class NoLoginTokenApi {
  private near: Near;

  constructor(near: Near) {
    this.near = near;
  }

  async storageDeposit(tokenAccountId: string, accountId: string, amount: string): Promise<void> {
    dumpLocalStorage();

    await this.setWalletAndContractWithAuth(accountId);

    await this.buildContract(tokenAccountId).storage_deposit({
      args: { account_id: accountId },
      gas: MAX_GAS,
      amount,
    });

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

  buildContract(contractName: string): TTokenContract {
    return new Contract(
      (new WalletConnection(this.near, this.near.config.contractName)).account(),
      contractName,
      { viewMethods: TOKEN_VIEW_METHODS, changeMethods: TOKEN_CHANGE_METHODS },
    ) as TTokenContract;
  }
}

export default NoLoginTokenApi;
