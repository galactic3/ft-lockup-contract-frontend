import {
  isValidNearAccountId,
  isValidTokenAmount,
  parseCliffInfo,
  parseSpreadsheetColumns,
  parseHumanFriendlySchedule,
  parseDuration,
  parseTimestamp,
  parseToSpreadsheetRow,
  parseSpreadsheetToSpreadsheetRows,
} from './spreadsheetImport';

describe('.parseSpreadsheetColumns', () => {
  it('parses empty string', () => {
    expect(parseSpreadsheetColumns('')).toStrictEqual([]);
  });

  it('parses multiple rows', () => {
    let actual = parseSpreadsheetColumns(`
      id	name	bio
      10	John Doe	Traveller, worker
      20	Foma Kinyaev	Secret agent
    `);
    let expected = [
      { id: '10', name: 'John Doe', bio: 'Traveller, worker' },
      { id: '20', name: 'Foma Kinyaev', bio: 'Secret agent' },
    ];
    expect(actual).toStrictEqual(expected);
  });

  it('trims each cell value', () => {
    let actual = parseSpreadsheetColumns(`
      column with space  	  second column  
      first value  	  second value  
    `);
    let expected = [{ 'column with space': 'first value', 'second column': 'second value' }];
    expect(actual).toStrictEqual(expected);
  });
});

describe('.isValidNearAccountId', () => {
  it('works', () => {
    expect(isValidNearAccountId('')).toBe(false);
    expect(isValidNearAccountId('a'.repeat(65))).toBe(false);
    expect(isValidNearAccountId('foo#near')).toBe(false);
    expect(isValidNearAccountId('foo.bar')).toBe(true);
  })
});

describe('.isValidTokenAmount', () => {
  it('works', () => {
    expect(isValidTokenAmount('123')).toBe(true);
    expect(isValidTokenAmount('123.')).toBe(false);
    expect(isValidTokenAmount('.456')).toBe(false);
    expect(isValidTokenAmount('123.456')).toBe(true);
  })
});

describe('.parseTimestamp', () => {
  it('works', () => {
    expect(parseTimestamp('2022-12-31T23:59:59Z')).toStrictEqual(new Date('2022-12-31T23:59:59Z'));
    expect(() => parseTimestamp('2022-12-31T23:59:59+03:00')).toThrow("invalid timestamp");
    expect(() => parseTimestamp('2022-12-31 23:59:59+03:00Z')).toThrow("invalid timestamp");
  })
});

describe('./parseDuration', () => {
  it('works', () => {
    expect(() => parseDuration('')).toThrow("invalid duration");
    expect(() => parseDuration('P1Y1W')).toThrow("invalid duration");
    expect(() => parseDuration('P1WT23H')).toThrow("invalid duration");
    expect(parseDuration('P99Y'))
      .toStrictEqual( { year: 99, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0 });
    expect(parseDuration('P12M'))
      .toStrictEqual( { year: 0, month: 12, week: 0, day: 0, hour: 0, minute: 0, second: 0 });
    expect(parseDuration('P52W'))
      .toStrictEqual( { year: 0, month: 0, week: 52, day: 0, hour: 0, minute: 0, second: 0 });
    expect(parseDuration('P365D'))
      .toStrictEqual( { year: 0, month: 0, week: 0, day: 365, hour: 0, minute: 0, second: 0 });
    expect(parseDuration('PT23H'))
      .toStrictEqual( { year: 0, month: 0, week: 0, day: 0, hour: 23, minute: 0, second: 0 });
    expect(parseDuration('PT59M'))
      .toStrictEqual( { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 59, second: 0 });
    expect(parseDuration('PT59S'))
      .toStrictEqual( { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 59 });
    expect(parseDuration('P99Y11M364DT23H59M48S'))
      .toStrictEqual( { year: 99, month: 11, week: 0, day: 364, hour: 23, minute: 59, second: 48 });
  });
});

describe('./parseCliffInfo', () => {
  it('works', () => {
    expect(() => parseCliffInfo('')).toThrow(/expected 2 parts/);
    expect(() => parseCliffInfo('P1Y:112')).toThrow(/invalid percentage/);
    expect(() => parseCliffInfo('P1Y:-7')).toThrow(/invalid percentage/);
    expect(parseCliffInfo('P1Y:25'))
      .toStrictEqual({ duration: parseDuration('P1Y'), percentage: 25 });
  });
});

describe('./parseHumanFriendlySchedule', () => {
  it('works', () => {
    expect(() => parseHumanFriendlySchedule('')).toThrow(/expected 4 parts/);
    expect(parseHumanFriendlySchedule('2017-07-14T23:59:48Z|P4Y|P1Y:25|P1M'))
      .toStrictEqual(
        {
          timestampStart: new Date('2017-07-14T23:59:48Z'),
          durationTotal: parseDuration('P4Y'),
          durationCliff: parseDuration('P1Y'),
          percentageCliff: 25,
          releaseEvery: parseDuration('P1M'),
        },
      );
  });
});

describe('./parseToSpreadsheetRow', () => {
  it('works', () => {
    let input: any;

    input = {
      account_id: 'alice.near',
      amount: '100000',
      lockup_schedule: '2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M',
      vesting_schedule: '2021-12-31T23:59:48Z|P4Y|P1Y:25|P1M',
      terminator_id: 'owner.near',
    };
    expect(parseToSpreadsheetRow(input))
      .toStrictEqual(
        {
          account_id: 'alice.near',
          amount: '100000',
          lockup_schedule: parseHumanFriendlySchedule('2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M'),
          vesting_schedule: parseHumanFriendlySchedule('2021-12-31T23:59:48Z|P4Y|P1Y:25|P1M'),
          terminator_id: 'owner.near',
        },
      );

    input = {
      account_id: 'alice.near',
      amount: '100000',
      lockup_schedule: '2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M',
      vesting_schedule: '2021-12-31T23:59:48Z|P4Y|P1Y:25|P1M',
      terminator_id: '',
    };
    // console.log(parseToSpreadsheetRow(input));
    expect(() => parseToSpreadsheetRow(input))
      .toThrow(/expected present terminator_id for present vesting_schedule/);

    input = {
      account_id: 'alice.near',
      amount: '100000',
      lockup_schedule: '2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M',
      vesting_schedule: '',
      terminator_id: 'owner.near',
    };
    // console.log(parseToSpreadsheetRow(input));
    expect(() => parseToSpreadsheetRow(input))
      .toThrow(/expected empty terminator_id for empty vesting_schedule/);

    input = {
      account_id: 'alice.near',
      amount: '100000',
      lockup_schedule: '2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M',
      vesting_schedule: '',
      terminator_id: '',
    };
    // console.log(parseToSpreadsheetRow(input));
    expect(() => parseToSpreadsheetRow(input))
      .not.toThrow(/expected empty terminator_id for empty vesting_schedule/);
  });
});

describe('./parseToSpreadsheetRow', () => {
  it('works', () => {
    let input: any;

    input = `
      account_id	amount	lockup_schedule	vesting_schedule	terminator_id
      alice.near	100000	2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M	2021-12-31T23:59:48Z|P4Y|P1Y:25|P1M	owner.near
    `
    expect(parseSpreadsheetToSpreadsheetRows(input))
      .toStrictEqual(
        [{
          account_id: 'alice.near',
          amount: '100000',
          lockup_schedule: parseHumanFriendlySchedule('2020-12-31T23:59:48Z|P4Y|P1Y:25|P1M'),
          vesting_schedule: parseHumanFriendlySchedule('2021-12-31T23:59:48Z|P4Y|P1Y:25|P1M'),
          terminator_id: 'owner.near',
        }],
      );
  });
})
