import {
  WalletConnection,
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

export const daoCouncilMembers = async (walletConnection: WalletConnection, accountAddress: string): Promise<any> => {
  try {
    const api = new AstroDaoApi(walletConnection, accountAddress);
    const councilsMembers = await api.getCouncilMembers();

    return { [accountAddress]: councilsMembers };
  } catch (e) {
    console.log('isDAO ERROR:', e);
    return undefined;
  }
};

export const buildFundDraftGroupProposalLink = (
  description: string,
  lockupContractAddress: string,
  tokenContractAddress: string,
  amountValue: string,
  draftGroupIndex: number,
  daoContractAddress: string,
): string => {
  const details = encodeURIComponent(description);
  const methodName = 'ft_transfer_call';
  const json = {
    receiver_id: lockupContractAddress,
    amount: amountValue,
    msg: JSON.stringify({ draft_group_id: draftGroupIndex }),
  };
  const actionsGas = '100'; // with this amount transaction completes in one go (without resubmit with additional gas)
  const actionDeposit = ONE_YOKTO;

  return customFunctionCallProposalFormLink(
    daoContractAddress,
    details,
    tokenContractAddress,
    methodName,
    json,
    actionsGas,
    actionDeposit,
  );
};

export const buildTerminateLockupProposalLink = (
  description: string,
  lockupContractAddress: string,
  lockupIndex: number,
  timestamp: number | null,
  daoContractAddress: string,
): string => {
  const details = encodeURIComponent(description);
  const methodName = 'terminate';
  const json = {
    lockup_index: lockupIndex,
    termination_timestamp: timestamp,
  };
  const actionsGas = '100'; // with this amount transaction completes in one go (without resubmit with additional gas)
  const actionDeposit = ONE_YOKTO;

  return customFunctionCallProposalFormLink(
    daoContractAddress,
    details,
    lockupContractAddress,
    methodName,
    json,
    actionsGas,
    actionDeposit,
  );
};

const utils = {
  buildProposalFormLink,
  customFunctionCallProposalFormLink,
  daoCouncilMembers,
  buildFundDraftGroupProposalLink,
  buildTerminateLockupProposalLink,
};

export default utils;
