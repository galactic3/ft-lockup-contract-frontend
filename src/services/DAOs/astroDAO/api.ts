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
      (new WalletConnection(this.near, this.near.config.contractName)).account(),
      contractId,
      { viewMethods: DAO_VIEW_METHODS, changeMethods: []},
    ) as TAstroDaoContract;
  }

  getContract(): TAstroDaoContract {
    return this.contract;
  }

  async getCouncilsMembers(): Promise<any> {
    const policy = JSON.parse(await this.contract.get_policy());

    const councils = policy['roles'].filter((role: any) => role.name === 'council');
    const councilsMembers = councils.map((council: any) => council['Groups']).flat();

    return councilsMembers;
  }
}

export default AstroDaoApi;
