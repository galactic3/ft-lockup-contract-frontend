// TODO move to the .env
const ASTRO_DAO_HOST = 'https://dev.app.astrodao.com';
const ASTRO_DAO_CONTRACT_ADDRESS = 'test-dao-001.sputnikv2.testnet';

export const MAX_GAS = '300';
export const ONE_YOKTO = '0.000000000000000000000001';

export const buildProposalFormLink = (
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

  return `${ASTRO_DAO_HOST}/dao/${ASTRO_DAO_CONTRACT_ADDRESS}/proposals?action=${action}&variant=${variant}&params=${JSON.stringify(params)}`;
};

export const customFunctionCallProposalFormLink = (
  details: string,
  smartContractAddress: string,
  methodName: string,
  json: any,
  actionsGas: string,
  actionDeposit: string,
  gas: string = MAX_GAS,
): string => buildProposalFormLink(
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

const utils = {
  buildProposalFormLink,
  customFunctionCallProposalFormLink,
};

export default utils;
