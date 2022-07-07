import { Big } from 'big.js';
import { TCheckpoint, TNearTimestamp, TSchedule } from './api';
import { pseudoUtcIsoDateTime } from '../utils';

export const interpolateRaw = (x0: number, y0: string, x1: number, y1: string, xM: number) : string => {
  if (x1 <= x0) {
    throw new Error('invalid range');
  }
  if (xM < x0 || xM >= x1) {
    throw new Error('xM out of bound');
  }

  const yM = new Big(y0).add(
    (new Big(y1).sub(new Big(y0)))
      .mul(new Big(xM.toString()).sub(new Big(x0.toString())))
      .div(new Big(x1.toString()).sub(new Big(x0.toString()))),
  );

  return yM.toFixed(0, Big.roundDown);
};

export const interpolateRawAtY = (x0: number, y0: string, x1: number, y1: string, yM: string) : TNearTimestamp => {
  if (x1 <= x0) {
    throw new Error('invalid range');
  }
  if (new Big(yM).lt(new Big(y0)) || new Big(yM).gte(y1)) {
    throw new Error('yM out of bound');
  }

  const xM = new Big(x0).add(
    (new Big(x1).sub(new Big(x0)))
      .mul(new Big(yM.toString()).sub(new Big(y0.toString())))
      .div(new Big(y1.toString()).sub(new Big(y0.toString()))),
  );

  return parseInt(xM.toFixed(0, Big.roundUp), 10);
};

export const interpolate = (checkpoint0: TCheckpoint, checkpoint1: TCheckpoint, timestamp: TNearTimestamp) : TCheckpoint => {
  const balance = interpolateRaw(
    checkpoint0.timestamp,
    checkpoint0.balance,
    checkpoint1.timestamp,
    checkpoint1.balance,
    timestamp,
  );

  return { timestamp, balance };
};

export const interpolateAtY = (checkpoint0: TCheckpoint, checkpoint1: TCheckpoint, balance: string) : TCheckpoint => {
  const timestamp = interpolateRawAtY(
    checkpoint0.timestamp,
    checkpoint0.balance,
    checkpoint1.timestamp,
    checkpoint1.balance,
    balance,
  );

  return { timestamp, balance };
};

export const interpolateSchedule = (schedule: TCheckpoint[], timestamp: TNearTimestamp) : TCheckpoint => {
  if (schedule.length === 0) {
    throw new Error('empty schedule');
  }

  if (timestamp < schedule[0].timestamp) {
    return { timestamp, balance: schedule[0].balance };
  }

  if (timestamp >= schedule[schedule.length - 1].timestamp) {
    return { timestamp, balance: schedule[schedule.length - 1].balance };
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < schedule.length - 1; i++) {
    if (schedule[i + 1].timestamp <= timestamp) {
      // eslint-disable-next-line no-continue
      continue;
    }
    return interpolate(schedule[i], schedule[i + 1], timestamp);
  }

  throw new Error('unreachable');
};

export const sumSchedules = (schedules: TSchedule[]) : TSchedule => {
  if (schedules.length === 0) {
    throw new Error('schedules is empty');
  }

  const timestamps = Array.from(new Set(schedules.flat().map((x) => x.timestamp).sort(
    (x, y) => x - y,
  )));

  const result: TSchedule = [];

  timestamps.forEach((timestamp:TNearTimestamp) => {
    let amount = new Big(0);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < schedules.length; i++) {
      const balance = new Big(interpolateSchedule(schedules[i], timestamp).balance);
      amount = amount.plus(balance);
    }
    result.push({ timestamp, balance: amount.toString() });
  });

  return result;
};

export const assertValidTerminationSchedule = (lockupSchedule: TSchedule, vestingSchedule: TSchedule) => {
  const f = (x: number) => `${pseudoUtcIsoDateTime(x)} UTC`;

  lockupSchedule.forEach((checkpoint) => {
    const { timestamp } = checkpoint;
    const lockupBalance = checkpoint.balance;
    const vestingBalance = interpolateSchedule(vestingSchedule, timestamp).balance;
    if (!(new Big(lockupBalance).lte(new Big(vestingBalance)))) {
      throw new Error(`The lockup schedule is ahead of the termination schedule at ${f(timestamp)} (${timestamp})`);
    }
  });
  vestingSchedule.forEach((checkpoint) => {
    const { timestamp } = checkpoint;
    const lockupBalance = interpolateSchedule(lockupSchedule, timestamp).balance;
    const vestingBalance = checkpoint.balance;
    if (!(new Big(lockupBalance).lte(new Big(vestingBalance)))) {
      throw new Error(`The lockup schedule is ahead of the termination schedule at ${f(timestamp)} (${timestamp})`);
    }
  });
};

export const terminateSchedule = (schedule: TSchedule, timestamp: TNearTimestamp) => {
  if (schedule.length === 0) {
    throw new Error('empty schedule');
  }

  if (timestamp <= schedule[0].timestamp) {
    return [
      schedule[0],
      { timestamp: schedule[0].timestamp + 1, balance: schedule[0].balance },
    ];
  }

  if (timestamp >= schedule[schedule.length - 1].timestamp) {
    return schedule.slice(0, schedule.length);
  }

  const result = [];

  for (let i = 0; i < schedule.length - 1; i += 1) {
    result.push(schedule[i]);

    if (timestamp < schedule[i + 1].timestamp) {
      const finishCheckpoint = interpolate(schedule[i], schedule[i + 1], timestamp);
      result.push(finishCheckpoint);
      return result;
    }

    if (timestamp === schedule[i + 1].timestamp) {
      result.push(schedule[i + 1]);
      return result;
    }
  }

  throw new Error('unreachable');
};

export const terminateScheduleAtAmount = (schedule: TSchedule, amount: string, finishTimestamp: TNearTimestamp) => {
  if (schedule.length === 0) {
    throw new Error('empty schedule');
  }

  if (new Big(amount).eq(new Big('0'))) {
    return [
      schedule[0],
      { timestamp: Math.max(schedule[0].timestamp + 1, finishTimestamp), balance: schedule[0].balance },
    ];
  }

  if (new Big(amount).gte(new Big(schedule[schedule.length - 1].balance))) {
    return schedule.slice(0, schedule.length);
  }

  const result = [];

  for (let i = 0; i < schedule.length - 1; i += 1) {
    result.push(schedule[i]);

    if (new Big(amount).lt(new Big(schedule[i + 1].balance))) {
      const finishCheckpoint = interpolateAtY(schedule[i], schedule[i + 1], amount);
      result.push(finishCheckpoint);
      return result;
    }

    if (new Big(amount).eq(new Big(schedule[i + 1].balance))) {
      result.push(schedule[i + 1]);
      return result;
    }
  }

  throw new Error('unreachable');
};

export type TBalancesRaw = {
  claimed: string,
  unclaimed: string,
  vested: string,
  unvested: string,
  total: string,
};

export const calcBalancesRaw = (row: any, now: number): TBalancesRaw => {
  const totalBalanceRaw = row.schedule[row.schedule.length - 1].balance;
  const claimedBalanceRaw = row.claimed_balance || '0';

  const unclaimedBalanceRaw = new Big(interpolateSchedule(row.schedule, now).balance).sub(new Big(claimedBalanceRaw)).toFixed();
  let vestedBalanceFullRaw = null;
  const vestingSchedule = row.vesting_schedule?.Schedule || row.termination_config?.vesting_schedule?.Schedule;
  if (vestingSchedule) {
    vestedBalanceFullRaw = interpolateSchedule(vestingSchedule, now).balance;
  } else {
    vestedBalanceFullRaw = row.schedule[row.schedule.length - 1].balance;
  }
  const vestedBalanceRaw = new Big(vestedBalanceFullRaw)
    .sub(new Big(claimedBalanceRaw))
    .sub(new Big(unclaimedBalanceRaw))
    .toString();
  const unvestedBalanceRaw = new Big(totalBalanceRaw)
    .sub(new Big(vestedBalanceFullRaw))
    .toString();
  console.log(totalBalanceRaw, claimedBalanceRaw, unclaimedBalanceRaw, vestedBalanceRaw, unvestedBalanceRaw);

  return {
    claimed: claimedBalanceRaw,
    unclaimed: unclaimedBalanceRaw,
    vested: vestedBalanceRaw,
    unvested: unvestedBalanceRaw,
    total: totalBalanceRaw,
  };
};

export type ValidAccountId = string;
export type TimestampSec = number;
export type Balance = string;
export type Checkpoint = {
  timestamp: TimestampSec,
  balance: Balance,
};
export type Schedule = Checkpoint[];
export type Lockup = {
  id: number,
  account_id: ValidAccountId,
  schedule: Schedule,
  vesting_schedule: { Schedule: Schedule } | null,
};
export type TLockupOrError = Lockup | Error;

export const lockupTotalBalance = (lockup: Lockup): Balance => lockup.schedule[lockup.schedule.length - 1].balance;

export const calcTotalBalance = (lockups: TLockupOrError[]) => {
  const lockupsFiltered = lockups.filter((x: TLockupOrError) => !(x instanceof Error)).map((x) => x as Lockup);
  const balances = lockupsFiltered.map((x: Lockup) => lockupTotalBalance(x));
  let result = new Big('0');

  balances.forEach((x) => {
    result = result.add(new Big(x));
  });
  return result.toString();
};
