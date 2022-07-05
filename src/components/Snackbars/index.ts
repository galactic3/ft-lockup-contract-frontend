import Big from 'big.js';

import success from './SuccessPartials';
import failure from './FailurePartials';
import { enqueueCustomSnackbar } from './Snackbar';
import { txLinkInExplorer, nearTo } from '../../utils';

const parseAmount = (unpacked: string, decimals: any): any => new Big(unpacked).div(new Big(10).pow(decimals)).round(2, Big.roundDown);

const claimSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any) => {
  if (unpacked && unpacked !== '0') {
    const amount = parseAmount(unpacked, token.decimals);

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Claimed ${amount} ${token.symbol}`),
      success.header('Claim succeed'),
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
        success.body(`Created lockup for ${txMsg.account_id} with amount ${amount} ${token.symbol}`),
        success.header('Create lockup succeed'),
        { autoHideDuration: 60_000 },
      );
    }
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Create lockup failed'),
  );
};

const fundDraftGroupSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any, txMsg: any) => {
  if (unpacked && unpacked !== '0') {
    const amount = parseAmount(unpacked, token.decimals);

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Funded draft group ${txMsg.draft_group_id} with amount ${amount} ${token.symbol}`),
      success.header('Fund draft group succeed'),
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Create lockup failed'),
  );
};

const terminateLockupSnack = (enqueueSnackbar: any, unpacked: any, txHash: string, token: any, lockup_index: any) => {
  if (unpacked) {
    const amount = parseAmount(unpacked, token.decimals);

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`Terminated lockup #${lockup_index}, unvested amount: ${amount} ${token.symbol}`),
      success.header('Terminate lockup succeed'),
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Terminate lockup failed'),
  );
};

type TVariant = {
  positive?: any,
  negative?: any,
};

const createDraftGroupSnack = (enqueueSnackbar: any, variant: TVariant) => {
  if (variant.negative) {
    const { txHash } = variant.negative;

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      failure.body(`${txLinkInExplorer(txHash)}`),
      failure.header('Create draft group failed'),
    );
  }

  const draftGroupId = variant.positive;

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    success.body(`Created draft group id: ${draftGroupId}`),
    success.header('Create draft group succeed'),
  );
};

const createDraftsSnack = (enqueueSnackbar: any, variant: TVariant) => {
  if (variant.negative) {
    const { txHash } = variant.negative;

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      failure.body(`${txLinkInExplorer(txHash)}`),
      failure.header('Create drafts failed'),
    );
  }

  const drafts = variant.positive;

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    success.body(`Created drafts ${drafts.length}.`),
    success.header('Create drafts succeed'),
  );
};

export {
  claimSnack,
  storageDepositSnack,
  createLockupSnack,
  fundDraftGroupSnack,
  terminateLockupSnack,
  createDraftGroupSnack,
  createDraftsSnack,
};
