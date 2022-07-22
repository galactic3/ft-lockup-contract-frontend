import Big from 'big.js';

import {
  Contract, WalletConnection,
} from 'near-api-js';

const MAX_GAS = 300_000_000_000_000;
const DEPLOY_DEPOSIT = new Big(10).mul(new Big(10).pow(24)).toString();

const FACTORY_CHANGE_METHODS = [
  'create',
];

type TFactoryChangeMethods = {
  'create': (opts: {
    args: { name: string, init_function: string, init_args: string },
    callbackUrl: string,
    amount: string | number,
    gas: string | number
  }) => any,
};

type TFactoryContract = Contract & TFactoryChangeMethods;

class FactoryApi {
  private contract: TFactoryContract;

  constructor(walletConnection: WalletConnection, contractId: string) {
    this.contract = new Contract(
      walletConnection.account(),
      contractId,
      { viewMethods: [], changeMethods: FACTORY_CHANGE_METHODS },
    ) as TFactoryContract;
  }

  getContract(): TFactoryContract {
    return this.contract;
  }

  async create(
    name: string,
    tokenAccountId: string,
    depositWhitelist: string[],
    draftOperatorsWhitelist: string[],
    callbackUrl: string,
  ): Promise<void> {
    const argsRaw = {
      token_account_id: tokenAccountId,
      deposit_whitelist: depositWhitelist,
      draft_operators_whitelist: draftOperatorsWhitelist,
    };
    const argsPacked = JSON.stringify(argsRaw);
    const result = await this.contract.create({
      args: {
        name,
        init_function: 'new',
        init_args: argsPacked,
      },
      callbackUrl,
      gas: MAX_GAS,
      amount: DEPLOY_DEPOSIT,
    });

    console.log(result);

    return result;
  }
}

export default FactoryApi;
