import {
  TTokenContract, TLockup, TCheckpoint, TLockupContract,
} from './api';

const MAX_GAS = 300_000_000_000_000;
const ONE_YOKTO = 1;

type TLockupMessage = {
  account_id: string,
  schedule: Array<TCheckpoint>,
  claimed_balance: string
};

class CreateLockupService {
  private lockupContract: TLockupContract;

  private tokenContract: TTokenContract;

  private lockupView: TLockup;

  private lockupTotalAmount: string;

  constructor(
    lockupContract: any,
    tokenContract: any,
    lockupView: TLockup,
    lockupTotalAmount: string,
  ) {
    this.lockupContract = lockupContract;
    this.tokenContract = tokenContract;
    this.lockupView = lockupView;
    this.lockupTotalAmount = lockupTotalAmount;
  }

  async call() {
    const meta = {
      receiver_id: this.lockupContract.contractId,
      amount: this.lockupTotalAmount,
      msg: JSON.stringify(this.lockupView as TLockupMessage),
    };

    await this.tokenContract.ft_transfer_call(meta, MAX_GAS, ONE_YOKTO);
  }
}

export default CreateLockupService;
