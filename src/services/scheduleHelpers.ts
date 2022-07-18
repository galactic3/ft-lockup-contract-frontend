import { Big } from 'big.js';
import { TCheckpoint, TNearTimestamp, TSchedule } from './api';

export const interpolateRaw = (x0: number, y0: number, x1: number, y1: number, xM: number) : Number => {
  if (x1 <= x0) {
    throw new Error('invalid range');
  }
  if (xM < x0 || xM >= x1) {
    throw new Error('xM out of bound');
  }

  const yM = y0 + (y1 - y0) * (xM - x0) / (x1 - x0);

  return yM;
};

export const interpolate = (checkpoint0: TCheckpoint, checkpoint1: TCheckpoint, timestamp: TNearTimestamp) : TCheckpoint => {
  const balance = interpolateRaw(
    checkpoint0.timestamp,
    parseFloat(checkpoint0.balance),
    checkpoint1.timestamp,
    parseFloat(checkpoint1.balance),
    timestamp,
  );

  return { timestamp, balance: balance.toString() };
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
  lockupSchedule.forEach((checkpoint) => {
    const { timestamp } = checkpoint;
    const lockupBalance = checkpoint.balance;
    const vestingBalance = interpolateSchedule(vestingSchedule, timestamp).balance;
    if (!(new Big(lockupBalance).lte(new Big(vestingBalance)))) {
      throw new Error(`The lockup schedule is ahead of the termination schedule at timestamp ${timestamp}`);
    }
  });
  vestingSchedule.forEach((checkpoint) => {
    const { timestamp } = checkpoint;
    const lockupBalance = interpolateSchedule(lockupSchedule, timestamp).balance;
    const vestingBalance = checkpoint.balance;
    if (!(new Big(lockupBalance).lte(new Big(vestingBalance)))) {
      throw new Error(`The lockup schedule is ahead of the termination schedule at timestamp ${timestamp}`);
    }
  });
};
