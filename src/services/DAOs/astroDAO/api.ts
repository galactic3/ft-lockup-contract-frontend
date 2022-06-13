import {
  Near, Contract, WalletConnection,
} from 'near-api-js';

const DAO_VIEW_METHODS = [
  'get_policy',
];

type TAstroDaoViewMethods = {
  'get_policy': any,
};

type TAstroDaoContract = Contract & TAstroDaoViewMethods;

class AstroDaoApi {
  private near: Near;

  private contract: TAstroDaoContract;

  constructor(near: Near, contractId: string) {
    this.near = near;
    this.contract = new Contract(
      (new WalletConnection(this.near, contractId)).account(),
      contractId,
      { viewMethods: DAO_VIEW_METHODS, changeMethods: [] },
    ) as TAstroDaoContract;
  }

  getContract(): TAstroDaoContract {
    return this.contract;
  }

  async getCouncilMembers(): Promise<string[]> {
    const policy = await this.contract.get_policy();

    const councilRole = policy.roles.filter((role: any) => role?.name === 'council').pop();
    return councilRole?.kind?.Group;
  }
}

export default AstroDaoApi;
