import {
  TTokenContract, TCheckpoint,
} from './api';

const MAX_GAS = 300_000_000_000_000;
const ONE_YOKTO = 1;

type TLockupMessage = {
  account_id: string,
  schedule: Array<TCheckpoint>,
  claimed_balance: string,
};

class CreateLockupService {
  private lockupContractId: string;

  private tokenContract: TTokenContract;

  private schedule: Array<TCheckpoint>;

  private lockupTotalAmount: string;

  private userAccountId: string;

  private claimedBalance: string;

  constructor(
    tokenContract: TTokenContract,
    schedule: Array<TCheckpoint>,
    lockupContractId: string,
    userAccountId: string,
    lockupTotalAmount: string,
    claimedBalance: string,
  ) {
    this.tokenContract = tokenContract;
    this.schedule = schedule;
    this.lockupContractId = lockupContractId;
    this.userAccountId = userAccountId;
    this.lockupTotalAmount = lockupTotalAmount;
    this.claimedBalance = claimedBalance;
  }

  async call() {
    const msg: TLockupMessage = {
      account_id: this.userAccountId,
      schedule: this.schedule,
      claimed_balance: this.claimedBalance,
    };

    const meta = {
      receiver_id: this.lockupContractId,
      amount: this.lockupTotalAmount,
      msg: JSON.stringify(msg),
    };

    await this.tokenContract.ft_transfer_call(meta, MAX_GAS, ONE_YOKTO);
  }
}

export default CreateLockupService;
