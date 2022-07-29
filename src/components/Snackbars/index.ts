import Big from 'big.js';

import success from './SuccessPartials';
import failure from './FailurePartials';
import { enqueueCustomSnackbar } from './Snackbar';
import {
  txLinkInExplorer,
  nearTo,
  formatTokenAmount,
} from '../../utils';

import { calcTotalBalance } from '../../services/scheduleHelpers';

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
        success.body(`${txMsg.account_id} now has a lockup of ${amount} ${token.symbol}`),
        success.header('Lockup created'),
        { autoHideDuration: 60_000 },
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
    );
  }

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    failure.body(`${txLinkInExplorer(txHash)}`),
    failure.header('Lockup termination failed'),
  );
};

type TVariant = {
  positive?: any,
  negative?: any,
  token?: any,
};

const createDraftGroupSnack = (enqueueSnackbar: any, variant: TVariant) => {
  if (variant.negative) {
    const { txHash } = variant.negative;

    return enqueueCustomSnackbar(
      enqueueSnackbar,
      failure.body(`${txLinkInExplorer(txHash)}`),
      failure.header('Draft group creation failed'),
    );
  }

  const draftGroupId = variant.positive;

  return enqueueCustomSnackbar(
    enqueueSnackbar,
    success.body(`Created draft group id: ${draftGroupId}`),
    success.header('Draft group created'),
  );
};

const createDraftsSnacks = (enqueueSnackbar: any, variant: TVariant) => {
  const posDraftsCount = variant.positive?.reduce((res:number, n: any) => res + n.originDrafts.length, 0) || 0;
  const negDraftsCount = variant.negative?.reduce((res:number, n: any) => res + n.originDrafts.length, 0) || 0;
  const totalDraftsCount = negDraftsCount + posDraftsCount;

  if (variant.positive?.length) {
    const lockupCreateArray = variant.positive.map((res: any) => res.originDrafts.map((od: any) => od.lockup_create)).flat();
    const posDraftsBalance = calcTotalBalance(lockupCreateArray);
    const totalPosDraftsBalance = formatTokenAmount(posDraftsBalance, variant.token.decimals);

    enqueueCustomSnackbar(
      enqueueSnackbar,
      success.body(`${posDraftsCount} of ${totalDraftsCount} drafts (${totalPosDraftsBalance} ${variant.token.symbol} in total) created and ready to be fund`),
      success.header('Drafts created'),
    );
  }

  if (variant.negative?.length) {
    const results = variant.negative;

    const linksTexts = results.map((res: any) => {
      const link = `${txLinkInExplorer(res.txHash)}`;
      const temp = res.originDrafts.map((el: any) => el.lockup_create.id);
      if (temp.length === 1) {
        return { text: `${temp[0]}`, link };
      }
      return { text: `[${temp[0]}-${temp[temp.length - 1]}]`, link };
    });

    const notifBody = {
      text: `${negDraftsCount} of ${totalDraftsCount} drafts are not created. See failed transactions:`,
      linksTexts,
    };

    enqueueCustomSnackbar(
      enqueueSnackbar,
      failure.createDraftsBody(notifBody),
      failure.header('Failed drafts'),
    );
  }
};

export {
  claimSnack,
  storageDepositSnack,
  createLockupSnack,
  fundDraftGroupSnack,
  terminateLockupSnack,
  createDraftGroupSnack,
  createDraftsSnacks,
};
