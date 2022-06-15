import {
  Near,
} from 'near-api-js';

import AstroDaoApi from './api';

// TODO move to the .env
const ASTRO_DAO_HOST = 'https://dev.app.astrodao.com';

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

export const daoCouncilMembers = async (near: Near, accountAddress: string): Promise<string[]> => {
  try {
    const api = new AstroDaoApi(near, accountAddress);
    const councilsMembers = await api.getCouncilMembers();

    return councilsMembers;
  } catch (e) {
    console.log('isDAO ERROR:', e);
    return [];
  }
};

const utils = {
  buildProposalFormLink,
  customFunctionCallProposalFormLink,
  daoCouncilMembers,
};

export default utils;
