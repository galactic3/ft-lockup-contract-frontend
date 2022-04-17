import {
  Contract, WalletConnection,
} from 'near-api-js';

const MAX_GAS = 300_000_000_000_000;
const ONE_YOKTO = 1;

type TTokenChangeMethods = {
  'ft_transfer_call': any,
};

type TTokenContract = Contract & TTokenChangeMethods;

class TokenApi {
  private contract: TTokenContract;

  constructor(walletConnection: WalletConnection, contractId: string) {
    this.contract = new Contract(walletConnection.account(), contractId, {
      viewMethods: [],
      changeMethods: ['ft_transfer_call'],
    }) as TTokenContract;

    console.log('tokenContract = ', this.contract);
  }

  getContract(): TTokenContract {
    return this.contract;
  }

  async ftTransferCall(
    meta: {
      receiver_id: string,
      amount: string,
      msg: {
        account_id: string,
        schedule: Array<any>,
        claimed_balance: string,
      },
    },
    gas = MAX_GAS,
    deposit = ONE_YOKTO,
  ) {
    const { msg, ...rest } = meta;

    await this.contract.ft_transfer_call(
      { msg: JSON.stringify(msg), ...rest },
      gas,
      deposit,
    );
  }
}

export default TokenApi;
