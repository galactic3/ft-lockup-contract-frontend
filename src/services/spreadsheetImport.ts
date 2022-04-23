import BN from 'bn.js';

export const parseSpreadsheetColumns = (input: string): any[] => {
  const colSep = '\t';
  const rowSep = '\n';
  const lines = input.trim().split(rowSep);
  if (lines.length <= 1) {
    return [];
  }
  let table = lines.map(line => line.split(colSep).map(x => x.trim()));
  const [columns, ...rowsSplit] = table;

  const rowsParsed = rowsSplit.map((row) => {
    return Object.fromEntries(
      columns.map((col, colIdx) => [col, row[colIdx] || '']),
    );
  });

  return rowsParsed;
};

type NearAccountId = string;

export const parseValidAccountId = (accountId: string): ValidAccountId => {
  let isValid = true;
  if (accountId.length < 2) isValid = false;
  if (accountId.length > 64) isValid = false;
  if (!accountId.match(/^[a-z0-9\._-]+$/)) isValid = false;

  if (isValid) {
    return accountId;
  } else {
    throw 'invalid near account id';
  }
};

type TokenAmount = string;

export const isValidTokenAmount = (amount: string): boolean => {
  return !!amount.match(/^[0-9]+(\.[0-9]+)?$/);
};

export const parseTimestamp = (timestamp: string): Date => {
  if (!timestamp.match(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ/)) {
    throw "invalid timestamp";
  }
  const result = new Date(timestamp);
  if (isNaN(result.getTime())) {
    throw "invalid timestamp";
  }

  return result;
}

type IsoDuration = {
  year: number,
  month: number,
  week: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
}

export const parseDuration = (input: string): IsoDuration => {
  // const pattern = /^(P(\d+Y)?(\d+M)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?|P(\d+W))$/;
  const pattern = /^P(((((?<year>\d+)Y)?((?<month>\d+)M)?((?<day>\d+)D)?)(T((?<hour>\d+)H)?((?<minute>\d+)M)?((?<second>\d+)S)?)?)|((?<week>\d+)W)?)$/;
  let match = input.match(pattern);
  if (!match) {
    throw "invalid duration";
  }

  let groups = match && match.groups || {};
  let result = {
    year: parseInt(groups.year) || 0,
    month: parseInt(groups.month) || 0,
    week: parseInt(groups.week) || 0,
    day: parseInt(groups.day) || 0,
    hour: parseInt(groups.hour) || 0,
    minute: parseInt(groups.minute) || 0,
    second: parseInt(groups.second) || 0,
  }

  return result;
}

type CliffInfo = {
  duration: IsoDuration,
  percentage: number,
};

export const parseCliffInfo = (input: string): CliffInfo => {
  const parts = input.split(':');
  if (parts.length !== 2) {
    throw 'expected 2 parts';
  }
  const [durationRaw, percentageRaw] = parts;
  const duration = parseDuration(durationRaw);
  const percentage = parseInt(percentageRaw, 10);
  if (percentage < 0 || percentage > 100) {
    throw 'invalid cliff percentage';
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
  let parts = schedule.split('|');
  if (parts.length !== 4) {
    throw "invalid human friendly schedule, expected 4 parts";
  }

  let [
    timestampStartRaw,
    durationTotalRaw,
    cliffInfoRaw,
    releaseEveryRaw,
  ] = parts;

  let timestampStart = parseTimestamp(timestampStartRaw);
  let durationTotal = parseDuration(durationTotalRaw);
  let cliffInfo = parseCliffInfo(cliffInfoRaw);
  let releaseEvery = parseDuration(releaseEveryRaw);

  return {
    timestampStart,
    durationTotal,
    durationCliff: cliffInfo.duration,
    percentageCliff: cliffInfo.percentage,
    releaseEvery,
  };
};

type SpreadsheetRow = {
  account_id: NearAccountId,
  amount: TokenAmount,
  lockup_schedule: HumanFriendlySchedule,
  vesting_schedule: HumanFriendlySchedule | null,
  terminator_id: NearAccountId | null,
};

export const parseToSpreadsheetRow = (input: any): SpreadsheetRow => {
  let account_id = parseValidAccountId(input.account_id);
  if (!isValidTokenAmount(input.amount)) {
    throw "invalid token amount";
  }
  let amount = input.amount;
  let lockup_schedule = parseHumanFriendlySchedule(input.lockup_schedule);
  let vesting_schedule = input.vesting_schedule === '' ? null : parseHumanFriendlySchedule(input.vesting_schedule);
  let terminator_id = null;
  if (vesting_schedule === null) {
    if (input.terminator_id === '') {
      terminator_id = null;
    } else {
      throw 'expected empty terminator_id for empty vesting_schedule';
    }
  } else {
    if (input.terminator_id === '') {
      throw 'expected present terminator_id for present vesting_schedule';
    } else {
      terminator_id = input.terminator_id;
    }
  }

  return {
    account_id, amount, lockup_schedule, vesting_schedule, terminator_id,
  }
};

export const parseSpreadsheetToSpreadsheetRows = (input: string): SpreadsheetRow[] => {
  let parsedStringRows = parseSpreadsheetColumns(input);

  return parsedStringRows.map(x => parseToSpreadsheetRow(x));
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
type Lockup = {
  account_id: ValidAccountId,
  schedule: Schedule,
  claimed_balance: Balance,
  termination_config: TerminationConfig | null,
};

export const datePlusDurationMul = (date: Date, duration: IsoDuration, mul: number): Date => {
  mul = Math.floor(mul);
  let result = new Date(Date.UTC(
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
  let timestampStart = schedule.timestampStart;
  let timestampCliff = datePlusDurationMul(timestampStart, schedule.durationCliff, 1);
  let timestampPreCliff = datePlusDurationMul(timestampCliff, parseDuration('PT1S'), -1);
  let timestampFinish = datePlusDurationMul(timestampStart, schedule.durationTotal, 1);

  // clone normalizes internal structure, needed for unit test equality
  let totalAmount = new BN(inputTotalAmount);
  let cliffAmount = new BN(totalAmount).muln(schedule.percentageCliff).divn(100).clone();

  if (cliffAmount.gt(totalAmount)) {
    throw 'error: cliffAmount > totalAmount';
  }
  if (timestampCliff > timestampFinish) {
    throw 'error: timestampCliff > timestampFinish';
  }
  if (timestampCliff < timestampStart) {
    throw 'error: timestampPreCliff < timestampStart';
  }

  let checkpointStart = { timestamp: toUnix(timestampStart), balance: new BN('0') };
  let checkpointPreCliff = { timestamp: toUnix(timestampPreCliff), balance: new BN('0') };
  let checkpointCliff = { timestamp: toUnix(timestampCliff), balance: cliffAmount };
  let checkpointFinish = { timestamp: toUnix(timestampFinish), balance: totalAmount };

  let result = [];
  result.unshift(checkpointFinish);
  if (checkpointCliff.timestamp < checkpointFinish.timestamp) {
    result.unshift(checkpointCliff);
  }
  result.unshift(checkpointPreCliff)
  if (checkpointStart.timestamp < checkpointPreCliff.timestamp) {
    result.unshift(checkpointStart);
  }

  return result;
};
