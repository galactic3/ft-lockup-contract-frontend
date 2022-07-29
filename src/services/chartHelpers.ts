import { Big } from 'big.js';

import {
  TSchedule, TNearTimestamp, TNearAmount, TCheckpoint,
} from './api';
import { formatTokenAmount } from '../utils';
import { sumSchedules, terminateScheduleAtAmount, shatterSchedule } from './scheduleHelpers';

const buildVestedSchedule = (from: TNearTimestamp, balance: TNearAmount) => [
  { timestamp: from - 1, balance: '0' },
  { timestamp: from, balance },
];

export const chartData = (lockupsList: any[], tokenDecimals: number): any => {
  const lockupSchedules = Array.from(
    lockupsList.map((x) => x.schedule),
  ) as TSchedule[];

  const now = Math.round(new Date().getTime() / 1000);
  const minTimestampsLockup = lockupsList.map((x) => x.schedule[0].timestamp);
  const minTimestampsVesting = lockupsList.map((x) => x?.termination_config?.vesting_schedule[0]?.timestamp).filter((x) => x);

  const minTimestamp = Math.min(...minTimestampsLockup, ...minTimestampsVesting, now);

  const vestingSchedules = Array.from(
    lockupsList.map((x) => {
      // for lockups and drafts
      const result = x?.termination_config?.vesting_schedule?.Schedule
        || x?.vesting_schedule?.Schedule;
      if (result) return result;
      return result || buildVestedSchedule(minTimestamp, x.schedule[x.schedule.length - 1].balance);
    }),
  ) as TSchedule[];

  let sumVesting = sumSchedules(vestingSchedules);
  let sumLockup = sumSchedules(lockupSchedules);

  if (sumVesting.length > 0) {
    if (sumVesting[sumVesting.length - 1].timestamp < sumLockup[sumLockup.length - 1].timestamp) {
      sumVesting.push(sumLockup[sumLockup.length - 1]);
    }
    if (sumVesting[sumVesting.length - 1].timestamp > sumLockup[sumLockup.length - 1].timestamp) {
      sumLockup.push(sumVesting[sumVesting.length - 1]);
    }
  }

  const convertSchedule = (schedule: TSchedule, decimals: number) => schedule.map((s: TCheckpoint) => [s.timestamp * 1000, formatTokenAmount(s.balance, decimals)]);

  const totalClaimed = lockupsList.map((x) => x.claimed_balance || '0').reduce((acc, x) => new Big(acc).add(new Big(x)).toFixed(), '0');

  // trim lockup schedule at claimed amount
  let sumClaimed = terminateScheduleAtAmount(sumLockup, totalClaimed, 0);

  if (sumClaimed[sumClaimed.length - 1]?.timestamp !== sumLockup[sumLockup.length - 1].timestamp) {
    sumClaimed.push({
      timestamp: sumLockup[sumLockup.length - 1].timestamp,
      balance: sumClaimed[sumClaimed.length - 1].balance,
    });
  }

  const existingCheckpoints = [sumLockup, sumVesting, sumClaimed]
    .flatMap((schedule) => schedule.map((x) => x.timestamp));

  const realMinTimestamp = Math.min(...existingCheckpoints);
  const maxTimestamp = Math.max(...existingCheckpoints);

  const dailyCheckpoints = [];
  for (let i = ((realMinTimestamp - 1) / (60 * 60 * 24) + 1) * (60 * 60 * 24); i < maxTimestamp; i += (60 * 60 * 24)) {
    dailyCheckpoints.push(i);
  }
  const allCheckpoints = [...existingCheckpoints, ...dailyCheckpoints];

  sumClaimed = shatterSchedule(sumClaimed, allCheckpoints);
  sumLockup = shatterSchedule(sumLockup, allCheckpoints);
  sumVesting = shatterSchedule(sumVesting, allCheckpoints);

  return {
    unlocked: lockupsList.length ? convertSchedule(sumLockup, tokenDecimals) : [],
    vested: lockupsList.length ? convertSchedule(sumVesting, tokenDecimals) : [],
    claimed: lockupsList.length ? convertSchedule(sumClaimed, tokenDecimals) : [],
  };
};

export default chartData;
