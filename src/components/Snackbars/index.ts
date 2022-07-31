import Big from 'big.js';

import success from './SuccessPartials';
import failure from './FailurePartials';
import { enqueueCustomSnackbar } from './Snackbar';
import { txLinkInExplorer, nearTo } from '../../utils';

export const SUCCESS_DEFAULT_OPTIONS = { autoHideDuration: 60_000 };

const parseAmount = (unpacked: string, decimals: any): any => new Big(unpacked).div(new Big(10).pow(decimals)).round(2, Big.roundDown);

const claimSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any) => {
  if (unpacked && unpacked !== '0') {
    const amount = parseAmount(unpacked, token.decimals);

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Claimed ${amount} ${token.symbol}`),
      success.header('Claim succeed'),
      SUCCESS_DEFAULT_OPTIONS,
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Claim failed'),
  );
};

const storageDepositSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any, accountId: any) => {
  if (unpacked) {
    const amount = parseFloat(nearTo(unpacked.total, 9)).toString();

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Successfully paid ${amount}NEAR for ${accountId}'s storage of ${token.symbol}`),
      success.header('Deposit storage succeed'),
      SUCCESS_DEFAULT_OPTIONS,
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Deposit storage failed'),
  );
};

const createLockupSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any, txMsg: any) => {
  if (unpacked) {
    const totalBalance = txMsg.schedule[txMsg.schedule.length - 1].balance;

    if (totalBalance === unpacked) {
      const amount = parseAmount(unpacked, token.decimals);

      return enqueueCustomSnackbar(
        enqueueSnackbar,
        success.body(`${txMsg.account_id} now has a lockup of ${amount} ${token.symbol}`),
        success.header('Lockup created'),
        SUCCESS_DEFAULT_OPTIONS,
      );
    }
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Lockup creation failed'),
  );
};

const fundDraftGroupSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any, txMsg: any) => {
  if (unpacked && unpacked !== '0') {
    const amount = parseAmount(unpacked, token.decimals);

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Draft group ${txMsg.draft_group_id} funded with amount ${amount} ${token.symbol}`),
      success.header('Draft group funded'),
      SUCCESS_DEFAULT_OPTIONS,
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Draft group fund failed'),
  );
};

const terminateLockupSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any, lockup_index: any) => {
  if (unpacked) {
    const amount = parseAmount(unpacked, token.decimals);

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Lockup #${lockup_index} was terminated. Unvested amount: ${amount} ${token.symbol}`),
      success.header('Lockup terminated'),
      SUCCESS_DEFAULT_OPTIONS,
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Lockup termination failed'),
  );
};

const deleteDraftGroupSnack = (enqueueSnackbar: any, message: { positive?: string, negative?: string }) => {
  if (message.positive) {
    enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(message.positive),
      success.header('Success'),
    );
  }

  if (message.negative) {
    enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(message.negative),
      failure.header('Failure'),
    );
  }
};

const discardDraftGroupSnack = (enqueueSnackbar: any, message: { positive?: string, negative?: string }) => {
  if (message.positive) {
    enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(message.positive),
      success.header('Success'),
    );
  }

  if (message.negative) {
    enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(message.negative),
      failure.header('Failure'),
    );
  }
};

export {
  claimSnack,
  storageDepositSnack,
  createLockupSnack,
  fundDraftGroupSnack,
  terminateLockupSnack,
  deleteDraftGroupSnack,
  discardDraftGroupSnack,
};
