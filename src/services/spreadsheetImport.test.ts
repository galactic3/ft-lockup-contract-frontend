import {
  datePlusDurationMul,
  parseValidAccountId,
  parseTokenAmount,
  parseCliffInfo,
  parseSpreadsheetColumns,
  parseHumanFriendlySchedule,
  parseDuration,
  parseLockup,
  parseRawSpreadsheetInput,
  parseTimestamp,
  parseToSpreadsheetRow,
  parseSpreadsheetToSpreadsheetRows,
  toLockupSchedule,
  toUnix,
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

describe('.parseValidAccountId', () => {
  it('works', () => {
    expect(() => parseValidAccountId('')).toThrow('invalid near account id');
    expect(() => parseValidAccountId('a'.repeat(65))).toThrow('invalid near account id');
    expect(() => parseValidAccountId('foo#near')).toThrow('invalid near account id');

    expect(parseValidAccountId('foo.bar')).toBe('foo.bar');
  })
});

describe('.parseTokenAmount', () => {
  it('works', () => {
    expect(parseTokenAmount('123')).toBe('123');
    expect(parseTokenAmount('123.456')).toBe('123.456');
    expect(() => parseTokenAmount('123.')).toThrow('invalid token amount');
    expect(() => parseTokenAmount('.456')).toThrow('invalid token amount');
  })
});

describe('.parseTimestamp', () => {
  it('works', () => {
    expect(parseTimestamp('2022-12-31T23:59:59Z')).toStrictEqual(new Date('2022-12-31T23:59:59Z'));
    expect(() => parseTimestamp('2022-12-31T23:59:59+03:00')).toThrow("invalid timestamp");
    expect(() => parseTimestamp('2022-12-31 23:59:59+03:00Z')).toThrow("invalid timestamp");
  })
});

describe('.parseDuration', () => {
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

describe('.parseCliffInfo', () => {
  it('works', () => {
    expect(() => parseCliffInfo('')).toThrow(/expected 2 parts/);
    expect(() => parseCliffInfo('P1Y:112')).toThrow(/invalid cliff percentage/);
    expect(() => parseCliffInfo('P1Y:-7')).toThrow(/invalid cliff percentage/);
    expect(parseCliffInfo('P1Y:25'))
      .toStrictEqual({ duration: parseDuration('P1Y'), percentage: 25 });
  });
});

describe('.parseHumanFriendlySchedule', () => {
  it('works', () => {
    expect(() => parseHumanFriendlySchedule('')).toThrow(/expected 4 parts/);
    expect(parseHumanFriendlySchedule('2017-07-14T23:59:48Z|P4Y|P1Y:25|PT1S'))
      .toStrictEqual(
        {
          timestampStart: new Date('2017-07-14T23:59:48Z'),
          durationTotal: parseDuration('P4Y'),
          durationCliff: parseDuration('P1Y'),
          percentageCliff: 25,
          releaseEvery: parseDuration('PT1S'),
        },
      );
  });
});

describe('.parseToSpreadsheetRow', () => {
  it('works', () => {
    let input: any;

    input = {
      account_id: 'alice.near',
      amount: '100000',
      lockup_schedule: '2020-12-31T23:59:48Z|P4Y|P1Y:25|PT1S',
      vesting_schedule: '2021-12-31T23:59:48Z|P4Y|P1Y:25|PT1S',
    };
    expect(parseToSpreadsheetRow(input))
      .toStrictEqual(
        {
          account_id: 'alice.near',
          amount: '100000',
          lockup_schedule: parseHumanFriendlySchedule('2020-12-31T23:59:48Z|P4Y|P1Y:25|PT1S'),
          vesting_schedule: parseHumanFriendlySchedule('2021-12-31T23:59:48Z|P4Y|P1Y:25|PT1S'),
        },
      );
  });
});

describe('.parseToSpreadsheetRow', () => {
  it('works', () => {
    let input: any;

    input = `
      account_id	amount	lockup_schedule	vesting_schedule
      alice.near	100000	2020-12-31T23:59:48Z|P4Y|P1Y:25|PT1S	2021-12-31T23:59:48Z|P4Y|P1Y:25|PT1S
    `
    expect(parseSpreadsheetToSpreadsheetRows(input))
      .toStrictEqual(
        [{
          account_id: 'alice.near',
          amount: '100000',
          lockup_schedule: parseHumanFriendlySchedule('2020-12-31T23:59:48Z|P4Y|P1Y:25|PT1S'),
          vesting_schedule: parseHumanFriendlySchedule('2021-12-31T23:59:48Z|P4Y|P1Y:25|PT1S'),
        }],
      );
  });
})

describe('.datePlusDurationMul', () => {
  it('works', () => {
    let m = datePlusDurationMul;
    let d = parseDuration;
    let tm = new Date('1999-12-31T23:59:59Z');

    expect(m(tm, d('PT0S'), 1)).toStrictEqual(new Date('1999-12-31T23:59:59Z'));

    expect(m(tm, d('P1Y'), 2)).toStrictEqual(new Date('2001-12-31T23:59:59Z'));

    expect(m(tm, d('P2M'), 1)).toStrictEqual(new Date('2000-03-02T23:59:59Z'));
    expect(m(tm, d('P3M'), 1)).toStrictEqual(new Date('2000-03-31T23:59:59Z'));

    expect(m(tm, d('P2W'), 1)).toStrictEqual(new Date('2000-01-14T23:59:59Z'));

    expect(m(tm, d('P5D'), 1)).toStrictEqual(new Date('2000-01-05T23:59:59Z'));

    expect(m(tm, d('PT36H'), 1)).toStrictEqual(new Date('2000-01-02T11:59:59Z'));

    expect(m(tm, d('PT90M'), 1)).toStrictEqual(new Date('2000-01-01T01:29:59Z'));

    expect(m(tm, d('PT86400S'), 1)).toStrictEqual(new Date('2000-01-01T23:59:59Z'));

    expect(m(tm, d('P1Y2M3DT4H5M6S'), 1)).toStrictEqual(new Date('2001-03-07T04:05:05Z'));
  });
})

describe('.toLockupSchedule', () => {
  it('works', () => {
    // basic
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P1Y:25|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2000-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('2000-12-31T23:59:59Z'), balance: '15000' + '000000000000' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // zero cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P1Y:0|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2000-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('2000-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // full amount cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P1Y:100|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2000-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('2000-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // full duration cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P4Y:25|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2003-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // zero duration cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P0Y:25|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '15000' + '000000000000' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // full duration zero amount cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P4Y:0|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2003-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // zero duration full amount cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P0Y:100|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
      { timestamp: toUnix('2003-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // one second duration lockup
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|PT1S|PT1S:25|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '0' },
      { timestamp: toUnix('2000-01-01T00:00:00Z'), balance: '60000' + '000000000000' },
    ]);

    // zero duration lockup
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|PT0S|PT0S:25|PT1S'),
        '60000',
        12,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '60000' + '000000000000' },
    ]);

    // decimals rounding
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|PT0S|PT0S:25|PT1S'),
        '9000.456789',
        3,
      )
    ).toStrictEqual([
      { timestamp: toUnix('1999-12-31T23:59:58Z'), balance: '0' },
      { timestamp: toUnix('1999-12-31T23:59:59Z'), balance: '9000' + '456' },
    ]);
    // controversial cases

    // cliff bigger than total duration
    expect(
      () => toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P5Y:25|PT1S'),
        '60000',
        12,
      )
    ).toThrow('error: timestampCliff > timestampFinish');
  });
})

describe('.toLockupSchedule releaseEvery', () => {
  it('works', () => {
    let tmStart = new Date('1999-12-31T23:59:59Z');
    let tmBuild = (duration: string): Date => {
      return datePlusDurationMul(tmStart, parseDuration(duration), 1);
    };
    // basic
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P2Y|P1Y:50|P6M'),
        '40000',
        12,
      ),
    ).toStrictEqual([
      // start
      { timestamp: toUnix(tmBuild('P0M')), balance: '0' },
      // cliff
      { timestamp: toUnix(tmBuild('P1Y')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P1Y')), balance: '20000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P1Y6M')) - 1, balance: '20000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P1Y6M')), balance: '30000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P2Y')) - 1, balance: '30000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P2Y')), balance: '40000' + '000000000000' },
    ]);

    // releaseEvery longer than aftercliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P2Y|P1Y:50|P10Y'),
        '40000',
        12,
      ),
    ).toStrictEqual([
      // start
      { timestamp: toUnix(tmBuild('P0M')), balance: '0' },
      // cliff
      { timestamp: toUnix(tmBuild('P1Y')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P1Y')), balance: '20000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P2Y')) - 1, balance: '20000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P2Y')), balance: '40000' + '000000000000' },
    ]);

    // releaseEvery not aligned with interval end
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P1Y:25|P2Y6M'),
        '80000',
        12,
      ),
    ).toStrictEqual([
      // start
      { timestamp: toUnix(tmBuild('P0M')), balance: '0' },
      // cliff
      { timestamp: toUnix(tmBuild('P1Y')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P1Y')), balance: '20000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P3Y6M')) - 1, balance: '20000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P3Y6M')), balance: '50000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P4Y')) - 1, balance: '50000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P4Y')), balance: '80000' + '000000000000' },
    ]);

    // zero duration zero amount cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P0Y:0|P2Y'),
        '80000',
        12,
      ),
    ).toStrictEqual([
      // cliff
      { timestamp: toUnix(tmBuild('P0M')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P0M')), balance: '0' },
      // period
      { timestamp: toUnix(tmBuild('P2Y')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P2Y')), balance: '40000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P4Y')) - 1, balance: '40000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P4Y')), balance: '80000' + '000000000000' },
    ]);

    // full duration cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P4Y:0|P1Y'),
        '80000',
        12,
      ),
    ).toStrictEqual([
      // cliff
      { timestamp: toUnix(tmBuild('P0M')), balance: '0' },
      // period
      { timestamp: toUnix(tmBuild('P4Y')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P4Y')), balance: '80000' + '000000000000' },
    ]);

    // full amount cliff
    expect(
      toLockupSchedule(
        parseHumanFriendlySchedule('1999-12-31T23:59:59Z|P4Y|P2Y:100|P1Y'),
        '80000',
        12,
      ),
    ).toStrictEqual([
      // cliff
      { timestamp: toUnix(tmBuild('P0M')), balance: '0' },
      // period
      { timestamp: toUnix(tmBuild('P2Y')) - 1, balance: '0' },
      { timestamp: toUnix(tmBuild('P2Y')), balance: '80000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P3Y')) - 1, balance: '80000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P3Y')), balance: '80000' + '000000000000' },
      // period
      { timestamp: toUnix(tmBuild('P4Y')) - 1, balance: '80000' + '000000000000' },
      { timestamp: toUnix(tmBuild('P4Y')), balance: '80000' + '000000000000' },
    ]);
  })
})

describe('.parseLockup', () => {
  it('works', () => {
    expect(
      parseLockup({
        account_id: 'alice.near',
        amount: '60000',
        lockup_schedule: '1999-12-31T23:59:59Z|P4Y|P2Y:50|PT1S',
        vesting_schedule: '1999-12-31T23:59:59Z|P4Y|P1Y:25|PT1S',
      }, 12, 'owner.near'),
    ).toStrictEqual(
      {
        account_id: "alice.near",
        claimed_balance: "0",
        schedule: [
          { balance: "0", timestamp: 946684799 },
          { balance: "0", timestamp: 1009843198 },
          { balance: "30000000000000000", timestamp: 1009843199 },
          { balance: "60000000000000000", timestamp: 1072915199 },
        ],
        termination_config: {
          payer_id: 'owner.near',
          vesting_schedule: {
            Schedule: [
              { balance: "0", timestamp: 946684799 },
              { balance: "0", timestamp: 978307198 },
              { balance: "15000000000000000", timestamp: 978307199 },
              { balance: "60000000000000000", timestamp: 1072915199 },
            ],
          },
        },
      },
    );
  });
})

describe('.parseRawSpreadsheetInput', () => {
  it('works', () => {
    expect(
      parseRawSpreadsheetInput(`
        account_id	amount	lockup_schedule	vesting_schedule
        alice.near	100000	2009-12-31T23:59:59Z|P4Y|P2Y:50|PT1S	
        bob.near	60000	1999-12-31T23:59:59Z|P4Y|P2Y:50|PT1S	1999-12-31T23:59:59Z|P4Y|P2Y:50|PT1S
      `, 12, 'owner.near'),
    ).toStrictEqual([
      {
        account_id: "alice.near",
        claimed_balance: '0',
        schedule: [
          { balance: '0', timestamp: 1262303999 },
          { balance: '0', timestamp: 1325375998 },
          { balance: '50000' + '000000000000', timestamp: 1325375999 },
          { balance: '100000' + '000000000000', timestamp: 1388534399 },
        ],
        termination_config: null,
      },
      {
        account_id: 'bob.near',
        claimed_balance: '0',
        schedule: [
          {balance: '0', timestamp: 946684799},
          {balance: '0', timestamp: 1009843198},
          {balance: '30000' + '000000000000', timestamp: 1009843199},
          {balance: '60000' + '000000000000', timestamp: 1072915199},
        ],
        termination_config: {
          payer_id: 'owner.near',
          vesting_schedule: {
            Schedule: [
              {balance: '0', timestamp: 946684799},
              {balance: '0', timestamp: 1009843198},
              {balance: '30000' + '000000000000', timestamp: 1009843199},
              {balance: '60000' + '000000000000', timestamp: 1072915199},
            ],
          },
        },
      },
    ]);
  });
})
