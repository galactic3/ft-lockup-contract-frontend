import {
  Near, Account, Contract, WalletConnection, utils,
} from 'near-api-js';
import { MAX_GAS, ONE_YOCTO } from '../utils';

export const fromNear = (amount: string): number => parseFloat(utils.format.formatNearAmount(amount || '0'));
export const toYoctoNear = (amount: number): string => utils.format.parseNearAmount(String(amount)) || '0';

const LOCKUP_VIEW_METHODS = [
  'get_draft_group',
  'get_draft_groups_paged',
  'get_drafts',
  'get_lockups_paged',
  'get_token_account_id',
  'get_deposit_whitelist',
  'get_draft_operators_whitelist',
];

const LOCKUP_CHANGE_METHODS = [
  'create_draft',
  'create_drafts',
  'create_draft_group',
  'convert_draft',
  'convert_drafts',
  'terminate',
  'discard_draft_group',
  'delete_drafts',
];

type TViewMethods = {
  'get_draft_group': any,
  'get_draft_groups_paged': any,
  'get_drafts': any,
  'get_lockups_paged': any,
  'get_token_account_id': any,
  'get_deposit_whitelist': any,
  'get_draft_operators_whitelist': any,
};

type TChangeMethods = {
  'create_draft': any,
  'create_drafts': any,
  'create_draft_group': any,
  'convert_draft': any,
  'convert_drafts': any,
  'terminate': any,
  'discard_draft_group': any,
  'delete_drafts': any,
};

export type TNearAmount = string;
export type TNearTimestamp = number;

export type TCheckpoint = {
  timestamp: TNearTimestamp,
  balance: TNearAmount,
};

export type TCheckpointWithIndex = {
  timestamp: TNearTimestamp,
  balance: TNearAmount,
  index: number;
};

export type TSchedule = TCheckpoint[];

export type TTerminationConfig = {
  beneficiary_id: TNearAmount,
  vesting_schedule: {
    Schedule: TSchedule,
  },
};

export type TLockup = {
  id: number,
  account_id: string,
  claimed_balance: TNearAmount,
  schedule: TSchedule,
  timestamp: TNearTimestamp,
  total_balance: TNearAmount,
  unclaimed_balance: TNearAmount,
  termination_config: TTerminationConfig | null,
};

export type TLockupContract = Contract & TViewMethods & TChangeMethods;

type Balance = string;
type DraftIndex = number;
type DraftGroupIndex = number;
type LockupIndex = number;

type DraftGroupView = {
  total_amount: Balance,
  funded: boolean,
  draft_indices: DraftIndex[],
};

type DraftView = {
  draft_group_id: DraftGroupIndex,
  lockup_id: LockupIndex | null,
  lockup: TLockup,
};

class NearApi {
  private near: Near;

  private contract: TLockupContract;

  private walletConnection: WalletConnection;

  constructor(near: Near) {
    this.near = near;
    this.walletConnection = new WalletConnection(near, near.config.contractName);
    this.contract = new Contract(
      this.walletConnection.account(),
      this.near.config.contractName,
      { viewMethods: LOCKUP_VIEW_METHODS, changeMethods: LOCKUP_CHANGE_METHODS },
    ) as TLockupContract;
  }

  async getDraftGroupsAll(): Promise<[DraftGroupView]> {
    const result = await this.contract.get_draft_groups_paged();
    return result.map(([draftIndex, draft]: [any, any]) => Object.assign(draft, { id: draftIndex }));
  }

  async getDraftGroup(index: number): Promise<DraftGroupView | null> {
    const result = await this.contract.get_draft_group({ index });
    if (result) {
      result.id = index;
    }

    return result;
  }

  async getDrafts(indices: number[]): Promise<Array<[DraftIndex, DraftView]>> {
    const result = await this.contract.get_drafts({ indices });

    return result;
  }

  async createDraftGroup(): Promise<DraftGroupIndex> {
    const result = await this.contract.create_draft_group();
    return result;
  }

  async createDraft(draft: any): Promise<DraftIndex> {
    const result = await this.contract.create_draft({ draft });

    return result;
  }

  async createDrafts(drafts: any[]): Promise<DraftIndex> {
    const result = await this.contract.create_drafts({ args: { drafts }, gas: '300000000000000' });

    return result;
  }

  async convertDrafts(indices: DraftIndex[]): Promise<LockupIndex[]> {
    const result = await this.contract.convert_drafts({ args: { draft_ids: indices }, gas: '300000000000000' });

    return result;
  }

  async discardDraftGroup(draftGroupId: number): Promise<any> {
    const result = await this.contract.discard_draft_group({ args: { draft_group_id: draftGroupId } });

    return result;
  }

  async deleteDrafts(draftIds: number[]): Promise<any> {
    const result = await this.contract.delete_drafts({ args: { draft_ids: draftIds } });

    return result;
  }

  async terminate(lockupIndex: number, timestamp: number | null): Promise<void> {
    try {
      const result = await this.contract.terminate({
        args: { lockup_index: lockupIndex, termination_timestamp: timestamp },
        gas: MAX_GAS,
        amount: ONE_YOCTO,
      });
      return result;
    } catch (e) {
      console.log(e);
      throw Error('Cannot terminate lockup');
    }
  }

  getNear(): Near {
    return this.near;
  }

  getWalletConnection(): WalletConnection {
    return this.walletConnection;
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

  getDraftOperatorsWhitelist(): Promise<Array<string>> {
    return this.contract.get_draft_operators_whitelist();
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
