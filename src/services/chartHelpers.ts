import {
  TSchedule, TNearTimestamp, TNearAmount, TCheckpoint,
} from './api';
import { formatTokenAmount } from '../utils';
import { sumSchedules } from './scheduleHelpers';

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

  const sumVesting = sumSchedules(vestingSchedules);
  const sumLockup = sumSchedules(lockupSchedules);

  if (sumVesting[sumVesting.length - 1]?.timestamp !== sumLockup[sumLockup.length - 1].timestamp) {
    sumVesting.push(sumLockup[sumLockup.length - 1]);
  }

  const convertSchedule = (schedule: TSchedule, decimals: number) => schedule.map((s: TCheckpoint) => [s.timestamp * 1000, formatTokenAmount(s.balance, decimals)]);

  return {
    unlocked: lockupsList.length ? convertSchedule(sumLockup, tokenDecimals) : [],
    vested: lockupsList.length ? convertSchedule(sumVesting, tokenDecimals) : [],
  };
};

export default chartData;
