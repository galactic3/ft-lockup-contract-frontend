import BN from 'bn.js';
import { TCheckpoint, TSchedule } from './api';
import { convertAmount } from '../utils';

export const getScheduleAmount = (schedules: TSchedule[], timestamp: number, decimals: number) => {
  // const decimalsMultiplier = new Big(10).pow(decimals);
  const schedule = schedules.flatMap((s: TCheckpoint[]) => s)
    .sort((a, b) => a.timestamp - b.timestamp);

  console.log(schedule);

  // ym = y0 + (y1 - y0) * (xm - x0) / (x1 - x0)

  let amount = '0';

  schedule.forEach((s, index) => {
    if (s.timestamp !== timestamp) {
      amount = schedule[index + 1] ? schedule[index + 1].balance : '0';
    } else {
      amount = s.balance;
    }
  });

  /* amount = new Big(schedule[i - 1].balance).plus(
      (new Big(schedule[i + 1].balance).minus(new Big(schedule[i - 1].balance)))
      * (schedule[i].timestamp - schedule[i - 1].timestamp) / (schedule[i + 1].timestamp - schedule[i].timestamp),
    );
  }

  console.log(item); */

  // @ts-ignore
  // const amount = item && convertAmount(item.balance, decimals);

  console.log(amount);

  return convertAmount(amount, decimals);
};

export const mergeSchedules = (schedules: TSchedule[], vestingSchedules: TSchedule[], decimals: number) => {
  const timestamps = Array.from(new Set(schedules.concat(vestingSchedules).flatMap((schedule: TCheckpoint[]) => schedule)
    .map((s) => s.timestamp)
    .sort((a, b) => a - b)));

  const mergeSchedule = timestamps.map((t) => [t, getScheduleAmount(schedules, t, decimals)]);

  console.log(timestamps);
  console.log(mergeSchedule);
};

export const mergeLockupSchedules = (schedules: TSchedule[], decimals: number) => {
  const schedule = schedules.flatMap((s: TCheckpoint[]) => s)
    .sort((a, b) => a.timestamp - b.timestamp);

  let s = new BN(0);
  const result = Array.from(schedule.reduce((m, x) => m.set(
    x.timestamp,
    (new BN(m.get(x.timestamp) || 0)).add(new BN(x.balance)),
  ), new Map()), ([t, balance]) => {
    s = s.add(balance);
    console.log(s);
    return [t * 1000, convertAmount(balance, decimals)];
  });

  console.log(result);

  return result;
};
