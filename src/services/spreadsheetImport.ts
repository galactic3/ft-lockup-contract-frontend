import BN from 'bn.js';

// TODO: replace with cleaner hack or another library
BN.prototype.toJSON = function toJSON() {
  return this.toString();
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
  if (amount.match(/^[0-9]+$/)) {
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

export const parseCliffInfo = (input: string): CliffInfo => {
  const parts = input.split(':');
  if (parts.length !== 2) {
    throw new Error('expected 2 parts');
  }
  const [durationRaw, percentageRaw] = parts;
  const duration = parseDuration(durationRaw);
  const percentage = parseInt(percentageRaw, 10);
  if (percentage < 0 || percentage > 100) {
    throw new Error('invalid cliff percentage');
  }
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

  const timestampStart = parseTimestamp(timestampStartRaw);
  const durationTotal = parseDuration(durationTotalRaw);
  const cliffInfo = parseCliffInfo(cliffInfoRaw);
  const releaseEvery = parseDuration(releaseEveryRaw);

  return {
    timestampStart,
    durationTotal,
    durationCliff: cliffInfo.duration,
    percentageCliff: cliffInfo.percentage,
    releaseEvery,
  };
};

type RawSpreadsheetRow = {
  account_id: string,
  amount: string,
  lockup_schedule: string,
  vesting_schedule: string,
  terminator_id: string,
};

type SpreadsheetRow = {
  account_id: NearAccountId,
  amount: TokenAmount,
  lockup_schedule: HumanFriendlySchedule,
  vesting_schedule: HumanFriendlySchedule | null,
  terminator_id: NearAccountId | null,
};

export const parseToSpreadsheetRow = (input: RawSpreadsheetRow): SpreadsheetRow => {
  const accountId = parseValidAccountId(input.account_id);
  const amount = parseTokenAmount(input.amount);
  const lockupSchedule = parseHumanFriendlySchedule(input.lockup_schedule);
  const vestingSchedule = input.vesting_schedule === '' ? null : parseHumanFriendlySchedule(input.vesting_schedule);
  let terminatorId = null;
  if (vestingSchedule === null) {
    if (input.terminator_id === '') {
      terminatorId = null;
    } else {
      throw new Error('expected empty terminator_id for empty vesting_schedule');
    }
  } else if (input.terminator_id === '') {
    throw new Error('expected present terminator_id for present vesting_schedule');
  } else {
    terminatorId = input.terminator_id;
  }

  return {
    account_id: accountId,
    amount,
    lockup_schedule: lockupSchedule,
    vesting_schedule: vestingSchedule,
    terminator_id: terminatorId,
  };
};

export const parseSpreadsheetToSpreadsheetRows = (input: string): SpreadsheetRow[] => {
  const parsedStringRows = parseSpreadsheetColumns(input);

  return parsedStringRows.map((x) => parseToSpreadsheetRow(x));
};

type ValidAccountId = string;
type TimestampSec = number;
type Balance = BN;
type Checkpoint = {
  timestamp: TimestampSec,
  balance: Balance,
};
type Schedule = Checkpoint[];
type TerminationConfig = {
  terminator_id: ValidAccountId,
  vesting_schedule: {
    Schedule: Schedule,
  },
};

export const buildTerminationConfig = (schedule: Schedule, terminator_id: ValidAccountId): TerminationConfig => ({
  terminator_id,
  vesting_schedule: {
    Schedule: schedule,
  },
});

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

export const toLockupSchedule = (schedule: HumanFriendlySchedule, inputTotalAmount: TokenAmount): Schedule => {
  const { timestampStart } = schedule;
  const timestampCliff = datePlusDurationMul(timestampStart, schedule.durationCliff, 1);
  const timestampPreCliff = datePlusDurationMul(timestampCliff, parseDuration('PT1S'), -1);
  const timestampFinish = datePlusDurationMul(timestampStart, schedule.durationTotal, 1);

  // clone normalizes internal structure, needed for unit test equality
  const totalAmount = new BN(inputTotalAmount);
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

  const checkpointStart = { timestamp: toUnix(timestampStart), balance: new BN('0') };
  const checkpointPreCliff = { timestamp: toUnix(timestampPreCliff), balance: new BN('0') };
  const checkpointCliff = { timestamp: toUnix(timestampCliff), balance: cliffAmount };
  const checkpointFinish = { timestamp: toUnix(timestampFinish), balance: totalAmount };

  const result = [];
  result.unshift(checkpointFinish);
  if (checkpointCliff.timestamp < checkpointFinish.timestamp) {
    result.unshift(checkpointCliff);
  }
  result.unshift(checkpointPreCliff);
  if (checkpointStart.timestamp < checkpointPreCliff.timestamp) {
    result.unshift(checkpointStart);
  }

  return result;
};

export type Lockup = {
  account_id: ValidAccountId,
  schedule: Schedule,
  claimed_balance: Balance,
  termination_config: TerminationConfig | null,
};

export const parseLockup = (rawSpreadsheetRow: RawSpreadsheetRow): Lockup => {
  const row = parseToSpreadsheetRow(rawSpreadsheetRow);

  let terminationConfig;
  if (row.vesting_schedule && row.terminator_id) {
    terminationConfig = buildTerminationConfig(toLockupSchedule(row.vesting_schedule, row.amount), row.terminator_id);
  } else {
    terminationConfig = null;
  }

  return {
    account_id: row.account_id,
    schedule: toLockupSchedule(row.lockup_schedule, row.amount),
    claimed_balance: new BN(0),
    termination_config: terminationConfig,
  };
};

export const parseRawSpreadsheetInput = (spreadsheetInput: string): Lockup[] => {
  const rows = parseSpreadsheetColumns(spreadsheetInput);
  return rows.map((x) => parseLockup(x));
};
