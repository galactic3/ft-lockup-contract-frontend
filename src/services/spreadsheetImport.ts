import BN from 'bn.js';
import Big from 'big.js';
import { assertValidTerminationSchedule } from './scheduleHelpers';

// TODO: replace with cleaner hack or another library
BN.prototype.toJSON = function toJSON() {
  return this.toString();
};

const prefixErrorWith = (prefix: string, callback: () => any) => {
  try {
    return callback();
  } catch (e) {
    if (!(e instanceof Error)) throw new Error('unreachable');
    e.message = `${prefix}: ${e.message}`;
    throw e;
  }
};

export const parseSpreadsheetColumns = (input: string): any[] => {
  const colSep = '\t';
  const rowSep = '\n';
  const lines = input.trim().split(rowSep);
  if (lines.length <= 1) {
    return [];
  }
  const table = lines.map((line) => line.split(colSep).map((x) => x.trim()));
  const [columns, ...rowsSplit] = table;

  const rowsParsed = rowsSplit.map((row) => Object.fromEntries(
    columns.map((col, colIdx) => [col, row[colIdx] || '']),
  ));

  return rowsParsed;
};

type NearAccountId = string;

export const parseValidAccountId = (accountId: string): ValidAccountId => {
  let isValid = true;
  if (accountId.length < 2) isValid = false;
  if (accountId.length > 64) isValid = false;
  if (!accountId.match(/^[a-z0-9._-]+$/)) isValid = false;

  if (isValid) {
    return accountId;
  }
  throw new Error('invalid near account id');
};

type TokenAmount = string;

export const parseTokenAmount = (amount: string): TokenAmount => {
  if (amount.match(/^[0-9]+(\.[0-9]+)?$/)) {
    return amount;
  }
  throw new Error('invalid token amount');
};

export const parseTimestamp = (timestamp: string): Date => {
  if (!timestamp.match(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ/)) {
    throw new Error('invalid timestamp');
  }
  const result = new Date(timestamp);
  if (Number.isNaN(result.getTime())) {
    throw new Error('invalid timestamp');
  }

  return result;
};

type IsoDuration = {
  year: number,
  month: number,
  week: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
};

export const parseDuration = (input: string): IsoDuration => {
  // const pattern = /^(P(\d+Y)?(\d+M)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?|P(\d+W))$/;
  const pattern = /^P(((((?<year>\d+)Y)?((?<month>\d+)M)?((?<day>\d+)D)?)(T((?<hour>\d+)H)?((?<minute>\d+)M)?((?<second>\d+)S)?)?)|((?<week>\d+)W)?)$/;
  const match = input.match(pattern);
  if (!match) {
    throw new Error('invalid duration');
  }

  const groups = match && match.groups || {};
  const result = {
    year: parseInt(groups.year, 10) || 0,
    month: parseInt(groups.month, 10) || 0,
    week: parseInt(groups.week, 10) || 0,
    day: parseInt(groups.day, 10) || 0,
    hour: parseInt(groups.hour, 10) || 0,
    minute: parseInt(groups.minute, 10) || 0,
    second: parseInt(groups.second, 10) || 0,
  };

  return result;
};

type CliffInfo = {
  duration: IsoDuration,
  percentage: number,
};

const parsePercentage = (input: string): number => {
  if (!(input.match(/^\d+$/))) {
    throw new Error('invalid cliff percentage');
  }

  const percentage = parseInt(input, 10);

  if (percentage < 0 || percentage > 100) {
    throw new Error('invalid cliff percentage');
  }

  return percentage;
};

export const parseCliffInfo = (input: string): CliffInfo => {
  const parts = input.split(':');
  if (parts.length !== 2) {
    throw new Error('expected 2 parts');
  }
  const [durationRaw, percentageRaw] = parts;
  const duration = parseDuration(durationRaw);
  const percentage = prefixErrorWith('percentage', () => parsePercentage(percentageRaw));
  return { duration, percentage };
};

type HumanFriendlySchedule = {
  timestampStart: Date,
  durationTotal: IsoDuration,
  durationCliff: IsoDuration,
  percentageCliff: number,
  releaseEvery: IsoDuration,
};

export const parseHumanFriendlySchedule = (schedule: string): HumanFriendlySchedule => {
  const parts = schedule.split('|');
  if (parts.length !== 4) {
    throw new Error('invalid human friendly schedule, expected 4 parts');
  }

  const [
    timestampStartRaw,
    durationTotalRaw,
    cliffInfoRaw,
    releaseEveryRaw,
  ] = parts;

  const timestampStart = prefixErrorWith('start timestamp', () => parseTimestamp(timestampStartRaw));
  const durationTotal = prefixErrorWith('duration', () => parseDuration(durationTotalRaw));
  const cliffInfo = prefixErrorWith('cliff', () => parseCliffInfo(cliffInfoRaw));
  const releaseEvery = prefixErrorWith('release every', () => parseDuration(releaseEveryRaw));

  return {
    timestampStart,
    durationTotal,
    durationCliff: cliffInfo.duration,
    percentageCliff: cliffInfo.percentage,
    releaseEvery,
  };
};

type RawSpreadsheetRow = any;

type SpreadsheetRow = {
  account_id: NearAccountId,
  amount: TokenAmount,
  lockup_schedule: HumanFriendlySchedule,
  vesting_schedule: HumanFriendlySchedule | null,
};

export const parseToSpreadsheetRow = (input: RawSpreadsheetRow): SpreadsheetRow => {
  const allowedKeys = ['account_id', 'amount', 'lockup_schedule', 'vesting_schedule'];
  Object.keys(input).forEach((key) => {
    if (!allowedKeys.includes(key)) {
      throw new Error(`unknown column '${key}'`);
    }
  });

  if (!input.account_id) throw new Error("column 'account_id' not found");
  const accountId = parseValidAccountId(input.account_id);

  if (!input.amount) throw new Error("column 'amount' not found");
  const amount = parseTokenAmount(input.amount);

  if (!input.lockup_schedule) throw new Error("column 'lockup_schedule' not found");
  const lockupSchedule = prefixErrorWith('lockup schedule', () => parseHumanFriendlySchedule(input.lockup_schedule));
  let vestingSchedule = null;

  if (input.vesting_schedule) {
    vestingSchedule = prefixErrorWith('vesting schedule', () => parseHumanFriendlySchedule(input.vesting_schedule));
  }

  return {
    account_id: accountId,
    amount,
    lockup_schedule: lockupSchedule,
    vesting_schedule: vestingSchedule,
  };
};

export const parseSpreadsheetToSpreadsheetRows = (input: string): SpreadsheetRow[] => {
  const parsedStringRows = parseSpreadsheetColumns(input);

  return parsedStringRows.map((x) => parseToSpreadsheetRow(x));
};

type ValidAccountId = string;
type TimestampSec = number;
type Balance = string;
type Checkpoint = {
  timestamp: TimestampSec,
  balance: Balance,
};
type Schedule = Checkpoint[];

export const datePlusDurationMul = (date: Date, duration: IsoDuration, mulInput: number): Date => {
  const mul = Math.floor(mulInput);
  const result = new Date(Date.UTC(
    date.getUTCFullYear() + duration.year * mul,
    date.getUTCMonth() + duration.month * mul,
    date.getUTCDate() + (duration.week * 7 + duration.day) * mul,
    date.getUTCHours() + duration.hour * mul,
    date.getUTCMinutes() + duration.minute * mul,
    date.getUTCSeconds() + duration.second * mul,
  ));
  return result;
};

export const toUnix = (date: Date | string) => Math.floor(new Date(date).getTime() / 1000);

export const toLockupSchedule = (schedule: HumanFriendlySchedule, inputTotalAmount: TokenAmount, tokenDecimals: number): Schedule => {
  if (!(tokenDecimals >= 0 && tokenDecimals === Math.floor(tokenDecimals))) {
    throw new Error('invalid token decimals');
  }
  const decimalsMultiplier = new Big(10).pow(tokenDecimals);

  const { timestampStart } = schedule;
  const timestampCliff = datePlusDurationMul(timestampStart, schedule.durationCliff, 1);
  const timestampPreCliff = datePlusDurationMul(timestampCliff, parseDuration('PT1S'), -1);
  const timestampFinish = datePlusDurationMul(timestampStart, schedule.durationTotal, 1);

  // clone normalizes internal structure, needed for unit test equality
  const totalAmount = new BN(new Big(inputTotalAmount).mul(decimalsMultiplier).round(0, Big.roundDown).toString());
  const cliffAmount = new BN(totalAmount).muln(schedule.percentageCliff).divn(100).clone();

  if (cliffAmount.gt(totalAmount)) {
    throw new Error('error: cliffAmount > totalAmount');
  }
  if (timestampCliff > timestampFinish) {
    throw new Error('error: timestampCliff > timestampFinish');
  }
  if (timestampCliff < timestampStart) {
    throw new Error('error: timestampPreCliff < timestampStart');
  }

  const { releaseEvery } = schedule;

  const tmCliff = timestampCliff;
  const tmFirstStep = datePlusDurationMul(timestampCliff, releaseEvery, 1);
  if (toUnix(tmFirstStep) <= toUnix(tmCliff)) {
    throw new Error('invalid releaseEvery, zero duration');
  }
  if (toUnix(tmFirstStep) - toUnix(tmCliff) === 1) { // linear unlock during cliff
    const cpStart = { timestamp: toUnix(timestampStart), balance: new BN('0').toString() };
    const cpPreCliff = { timestamp: toUnix(timestampPreCliff), balance: new BN('0').toString() };
    const cpCliff = { timestamp: toUnix(timestampCliff), balance: cliffAmount.toString() };
    const cpFinish = { timestamp: toUnix(timestampFinish), balance: totalAmount.toString() };

    const result = [];
    result.unshift(cpFinish);
    if (cpCliff.timestamp < cpFinish.timestamp) {
      result.unshift(cpCliff);
    }
    result.unshift(cpPreCliff);
    if (cpStart.timestamp < cpPreCliff.timestamp) {
      result.unshift(cpStart);
    }

    return result;
  }

  const tms = [];
  {
    // otherwise: use steps
    let tm = timestampCliff;
    const maxSteps = 500;
    for (;;) {
      if (tm >= timestampFinish) {
        tm = timestampFinish;
        tms.push(tm);
        break;
      }
      tms.push(tm);
      tm = datePlusDurationMul(tm, releaseEvery, 1);
      if (tms.length >= maxSteps) {
        throw new Error('too many checkpoints for schedule');
      }
    }
  }

  const increment = totalAmount.sub(cliffAmount).divn(tms.length - 1);

  const cps: Checkpoint[] = tms.flatMap((tm, i) => {
    if (tms.length === 1) {
      return [{ timestamp: toUnix(timestampFinish), balance: totalAmount.toString() }];
    }
    if (i === 0) {
      return [{ timestamp: toUnix(tm), balance: cliffAmount.toString() }];
    }
    const stepBalance = i === tms.length - 1
      ? totalAmount
      : cliffAmount.add(increment.muln(i)).toString();
    return [
      { timestamp: toUnix(tm) - 1, balance: cliffAmount.add(increment.muln(i - 1)).toString() },
      { timestamp: toUnix(tm), balance: stepBalance.toString() },
    ];
  });

  const cpsStart: Checkpoint[] = [];
  const cpStart = { timestamp: toUnix(timestampStart), balance: new BN('0').toString() };
  const cpPreCliff = { timestamp: toUnix(timestampPreCliff), balance: new BN('0').toString() };

  cpsStart.unshift(cpPreCliff);
  if (cpStart.timestamp < cpPreCliff.timestamp) {
    cpsStart.unshift(cpStart);
  }

  const result = cpsStart.concat(cps);
  return result;
};

export type Lockup = {
  id: number,
  account_id: ValidAccountId,
  schedule: Schedule,
  vesting_schedule: { Schedule: Schedule } | null,
};

export const parseLockup = (rawSpreadsheetRow: RawSpreadsheetRow, tokenDecimals: number, index: number): Lockup => {
  const row = parseToSpreadsheetRow(rawSpreadsheetRow);

  const lockupSchedule = toLockupSchedule(row.lockup_schedule, row.amount, tokenDecimals);
  let vestingSchedulePacked = null;

  if (row.vesting_schedule) {
    const vestingSchedule = toLockupSchedule(row.vesting_schedule, row.amount, tokenDecimals);
    assertValidTerminationSchedule(lockupSchedule, vestingSchedule);
    vestingSchedulePacked = { Schedule: vestingSchedule };
  }

  return {
    id: index,
    account_id: row.account_id,
    schedule: lockupSchedule,
    vesting_schedule: vestingSchedulePacked,
  };
};

export const parseRawSpreadsheetInput = (spreadsheetInput: string, tokenDecimals: number): Lockup[] => {
  const rows = parseSpreadsheetColumns(spreadsheetInput);
  return rows.map((x, index: number) => parseLockup(x, tokenDecimals, index));
};

export type TLockupOrError = Lockup | Error;

export const parseRawSpreadsheetInputWithErrors = (spreadsheetInput: string, tokenDecimals: number): TLockupOrError[] => {
  const rows = parseSpreadsheetColumns(spreadsheetInput);
  return rows.map((x, index: number) => {
    try {
      return parseLockup(x, tokenDecimals, index);
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
      throw new Error('unreachable');
    }
  });
};

export const lockupTotalBalance = (lockup: Lockup): Balance => lockup.schedule[lockup.schedule.length - 1].balance;
