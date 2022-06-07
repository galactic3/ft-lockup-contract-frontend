import AstroDaoApi from "./api";
import {
  Near,
} from 'near-api-js';

// TODO move to the .env
const ASTRO_DAO_HOST = 'https://dev.app.astrodao.com';

const ASTRO_DAO_CONTRACTS_ADDRESSES = [
  'test-dao-001.sputnikv2.testnet',
];

export const MAX_GAS = '300';
export const ONE_YOKTO = '0.000000000000000000000001';

export const buildProposalFormLink = (
  contractAddress: string,
  action: string,
  variant: string,
  details: string,
  smartContractAddress: string,
  methodName: string,
  json: any,
  actionsGas: string,
  actionDeposit: string,
  gas: string,
): string => {
  const params = {
    details,
    smartContractAddress,
    methodName,
    json,
    actionsGas,
    gas,
    deposit: actionDeposit,
  };

  return `${ASTRO_DAO_HOST}/dao/${contractAddress}/proposals?action=${action}&variant=${variant}&params=${JSON.stringify(params)}`;
};

export const customFunctionCallProposalFormLink = (
  contractAddress: string,
  details: string,
  smartContractAddress: string,
  methodName: string,
  json: any,
  actionsGas: string,
  actionDeposit: string,
  gas: string = MAX_GAS,
): string => buildProposalFormLink(
  contractAddress,
  'create_proposal',
  'ProposeCustomFunctionCall',
  details,
  smartContractAddress,
  methodName,
  json,
  actionsGas,
  actionDeposit,
  gas,
);

const daoCouncilMember = async (near: Near, accountAddress: string, daoContractAddress: string = ASTRO_DAO_CONTRACTS_ADDRESSES[0]): Promise<boolean> => {
  const astroDaoApi = new AstroDaoApi(near, daoContractAddress);
  const allMembersAddresses = await astroDaoApi.getCouncilsMembers();

  return allMembersAddresses.filter((memberAddress: string) => memberAddress === accountAddress).count > 0;
}

const utils = {
  buildProposalFormLink,
  customFunctionCallProposalFormLink,
  daoCouncilMember,
};

export default utils;
