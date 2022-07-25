import { Big } from 'big.js';
import { TCheckpoint, TNearTimestamp, TSchedule } from './api';

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

  return parseInt(xM.toFixed(0, Big.roundUp));
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

  for (let i = 0; i < schedule.length - 1; i++) {
    result.push(schedule[i]);

    if (timestamp < schedule[i + 1].timestamp) {
      let finishCheckpoint = interpolate(schedule[i], schedule[i + 1], timestamp);
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

  for (let i = 0; i < schedule.length - 1; i++) {
    result.push(schedule[i]);

    if (new Big(amount).lt(new Big(schedule[i + 1].balance))) {
      let finishCheckpoint = interpolateAtY(schedule[i], schedule[i + 1], amount);
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
