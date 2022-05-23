const DAO_HOST = 'https://dev.app.astrodao.com';
const DAO_CONTRACT_ADDRESS = 'test-dao-001.sputnikv2.testnet';

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

  return `${DAO_HOST}/dao/${DAO_CONTRACT_ADDRESS}/proposals?action=${action}&variant=${variant}&params=${JSON.stringify(params)}`;
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

const astraDAOUtils = {
  buildProposalFormLink,
  customFunctionCallProposalFormLink,
};

export default astraDAOUtils;
