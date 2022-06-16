// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { TCheckpoint, TNearTimestamp } from './api';

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
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i + 1].timestamp <= timestamp) {
      // eslint-disable-next-line no-continue
      continue;
    }
    return interpolate(schedule[i], schedule[i + 1], timestamp);
  }

  throw new Error('not found');
};
