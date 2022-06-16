import {
  Near, Contract, WalletConnection,
} from 'near-api-js';

const FUNCTION_CALL_CREATE_PROPOSAL_PERMISSIONS = ['call:AddProposal', '*:AddProposal'];

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
    const canProposalRoles = policy.roles.filter(
      (role: any) => role?.permissions?.includes(FUNCTION_CALL_CREATE_PROPOSAL_PERMISSIONS[0]) || role?.permissions?.includes(FUNCTION_CALL_CREATE_PROPOSAL_PERMISSIONS[1]),
    );

    if (canProposalRoles.length === 0) {
      return [];
    }

    const canProposalGroups = canProposalRoles.map((role: any) => role?.kind?.Group);

    return canProposalGroups.flat().filter((member: any) => member);
  }
}

export default AstroDaoApi;
