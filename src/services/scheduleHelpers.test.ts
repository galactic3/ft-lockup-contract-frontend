import {
  interpolate, interpolateRaw, interpolateSchedule, sumSchedules,
  assertValidTerminationSchedule, terminateSchedule, interpolateRawAtY,
  interpolateAtY, terminateScheduleAtAmount, shatterSchedule,
} from './scheduleHelpers';

describe('interpolateRaw test', () => {
  it('test interpolate doesn\'t throw', () => {
    interpolateRaw(1_500_000_000, (10_000).toString(), 1_700_000_000, (14_000).toString(), 1_550_000_000);
  });
  it('raises error if invalid input', () => {
    expect(() => interpolateRaw(
      1_800_000_000,
      (10_000).toString(),
      1_700_000_000,
      (14_000).toString(),
      1_550_000_000,
    )).toThrow('invalid range');
    expect(() => interpolateRaw(
      1_500_000_000,
      (10_000).toString(),
      1_700_000_000,
      (14_000).toString(),
      1_450_000_000,
    )).toThrow('xM out of bound');
    expect(() => interpolateRaw(
      1_500_000_000,
      (10_000).toString(),
      1_700_000_000,
      (14_000).toString(),
      1_750_000_000,
    )).toThrow('xM out of bound');
  });
  it('returns starting value at the beginning of range', () => {
    expect(interpolateRaw(1_500_000_000, (10_000).toString(), 1_700_000_000, (14_000).toString(), 1_500_000_000))
      .toStrictEqual((10_000).toString());
  });
  it('returns valid intermediate value', () => {
    expect(interpolateRaw(1_500_000_000, (10_000).toString(), 1_700_000_000, (14_000).toString(), 1_550_000_000))
      .toStrictEqual((11_000).toString());
  });

  it('doesnt round less significant digits', () => {
    expect(
      interpolateRaw(
        1_500_000_000, (0).toString(),
        1_800_000_000, (1_000_000_000_000_000_000_000_000).toString(),
        1_700_000_000,
      )
    )
      .toStrictEqual(('666_666_666_666_666_666_666_666'.replaceAll('_', '')).toString());
  });
});

describe('interpolateRawAtY test', () => {
  it('test interpolate doesnt throw', () => {
    interpolateRawAtY(1_500_000_000, (10_000).toString(), 1_700_000_000, (14_000).toString(), (11_000).toString());
  });
  it('raises error if invalid input', () => {
    expect(() => interpolateRawAtY(
      1_800_000_000,
      (10_000).toString(),
      1_700_000_000,
      (14_000).toString(),
      (11_000).toString(),
    )).toThrow('invalid range');
    expect(() => interpolateRawAtY(
      1_500_000_000,
      (10_000).toString(),
      1_700_000_000,
      (14_000).toString(),
      (9_000).toString(),
    )).toThrow('yM out of bound');
    expect(() => interpolateRawAtY(
      1_500_000_000,
      (10_000).toString(),
      1_700_000_000,
      (14_000).toString(),
      (15_000).toString(),
    )).toThrow('yM out of bound');
  });
  it('returns starting value at the beginning of range', () => {
    expect(interpolateRawAtY(
      1_500_000_000, (10_000).toString(), 1_700_000_000, (14_000).toString(), (10_000).toString())
    ).toStrictEqual(1_500_000_000);
  });
  it('returns valid intermediate value', () => {
    expect(interpolateRawAtY(
      1_500_000_000, (10_000).toString(), 1_700_000_000, (14_000).toString(), (11_000).toString())
    ).toStrictEqual(1_550_000_000);
  });

  it('doesnt round less significant digits', () => {
    expect(
      interpolateRawAtY(
        1_500_000_000, (0).toString(),
        1_600_000_000, '3_000_000_000_000_000_000_000_000'.replaceAll('_', ''),
        '1_000_000_000_000_000_000_000_000'.replaceAll('_', ''),
      )
    )
      .toStrictEqual(1_533_333_334);
  });
});

describe('interpolate test', () => {
  it('returns valid intermediate value', () => {
    expect(interpolate(
      { timestamp: 1_500_000_000, balance: '10000' },
      { timestamp: 1_700_000_000, balance: '14000' },
      1_550_000_000,
    )).toStrictEqual({ timestamp: 1_550_000_000, balance: '11000' });
  });
});

describe('interpolateAtY test', () => {
  it('returns valid intermediate value', () => {
    expect(interpolateAtY(
      { timestamp: 1_500_000_000, balance: '10000' },
      { timestamp: 1_700_000_000, balance: '14000' },
      '11000',
    )).toStrictEqual({ timestamp: 1_550_000_000, balance: '11000' });
  });
});

describe('interpolateSchedule test', () => {
  const schedule = [
    { timestamp: 1_500_000_000, balance: '0' },
    { timestamp: 1_599_999_999, balance: '0' },
    { timestamp: 1_600_000_000, balance: '15000' },
    { timestamp: 1_900_000_000, balance: '60000' },
  ];
  it('handles empty schedule', () => {
    // if schedule is empty throw error
    expect(() => interpolateSchedule(
      [],
      1_550_000_000,
    )).toThrow('empty schedule');
  });
  // if timestamp before schedule stamp returns first checkpoint
  it('handles timestamp before schedule', () => {
    const timestamp1 = 1_450_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp1,
    )).toStrictEqual({ timestamp: timestamp1, balance: '0' });
    const timestamp2 = 1_500_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp2,
    )).toStrictEqual({ timestamp: timestamp2, balance: '0' });
  });
  // if timestamp after schedule stamp returns last checkpoint
  it('handles timestamp after schedule', () => {
    const timestamp1 = 1_950_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp1,
    )).toStrictEqual({ timestamp: timestamp1, balance: '60000' });
    const timestamp2 = 1_900_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp2,
    )).toStrictEqual({ timestamp: timestamp2, balance: '60000' });
  });
  // if timestamp matches checkpoint from schedule return checkpoint from schedule
  it('handles timestamp that matches checkpoint from schedule', () => {
    const timestamp0 = 1_599_999_999;
    expect(interpolateSchedule(
      schedule,
      timestamp0,
    )).toStrictEqual({ timestamp: timestamp0, balance: '0' });
    const timestamp1 = 1_600_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp1,
    )).toStrictEqual({ timestamp: timestamp1, balance: '15000' });
  });
  // if between two checkpoints returns interpolated value
  it('handles timestamp between two checkpoints', () => {
    const timestamp0 = 1_550_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp0,
    )).toStrictEqual({ timestamp: timestamp0, balance: '0' });
    const timestamp1 = 1_700_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp1,
    )).toStrictEqual({ timestamp: timestamp1, balance: '30000' });
  });
});
describe('sumSchedules', () => {
  it('doesnt throw', () => {
    const schedule1 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_900_000_000, balance: '60000' },
    ];
    const schedule2 = [
      { timestamp: 1_600_000_000, balance: '0' },
      { timestamp: 1_700_000_000, balance: '20000' },
    ];
    sumSchedules([schedule1, schedule2]);
  });
  // should return expected
  it('should return expected1', () => {
    const schedule1 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_900_000_000, balance: '60000' },
    ];
    const schedule2 = [
      { timestamp: 1_600_000_000, balance: '0' },
      { timestamp: 1_700_000_000, balance: '20000' },
    ];
    const expected1 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '15000' },
      { timestamp: 1_700_000_000, balance: '50000' },
      { timestamp: 1_900_000_000, balance: '80000' },
    ];
    expect(sumSchedules([schedule1, schedule2])).toStrictEqual(expected1);
  });
  it('should return expected2', () => {
    const schedule3 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_700_000_000, balance: '20000' },
    ];
    const schedule4 = [
      { timestamp: 1_600_000_000, balance: '0' },
      { timestamp: 1_900_000_000, balance: '60000' },
    ];
    const expected2 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '10000' },
      { timestamp: 1_700_000_000, balance: '40000' },
      { timestamp: 1_900_000_000, balance: '80000' },
    ];
    expect(sumSchedules([schedule3, schedule4])).toStrictEqual(expected2);
  });
  it('should return expected3', () => {
    const schedule5 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
    ];
    const schedule6 = [
      { timestamp: 1_700_000_000, balance: '0' },
      { timestamp: 1_900_000_000, balance: '60000' },
    ];
    const expected3 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '20000' },
      { timestamp: 1_900_000_000, balance: '80000' },
    ];
    expect(sumSchedules([schedule5, schedule6])).toStrictEqual(expected3);
  });
  it('should return expected4', () => {
    const schedule7 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ];
    const schedule8 = [
      { timestamp: 1_550_000_000, balance: '0' },
      { timestamp: 1_650_000_000, balance: '20000' },
      { timestamp: 1_750_000_000, balance: '30000' },
    ];
    const expected4 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_550_000_000, balance: '10000' },
      { timestamp: 1_600_000_000, balance: '30000' },
      { timestamp: 1_650_000_000, balance: '45000' },
      { timestamp: 1_700_000_000, balance: '55000' },
      { timestamp: 1_750_000_000, balance: '60000' },
    ];
    expect(sumSchedules([schedule7, schedule8])).toStrictEqual(expected4);
  });
  it('should return expected5', () => {
    const schedule09 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '10000' },
      { timestamp: 1_700_000_000, balance: '10000' },
      { timestamp: 1_800_000_000, balance: '20000' },
    ];
    const schedule10 = [
      { timestamp: 1_600_000_000, balance: '0' },
      { timestamp: 1_700_000_000, balance: '20000' },
      { timestamp: 1_800_000_000, balance: '20000' },
      { timestamp: 1_900_000_000, balance: '40000' },
    ];
    const expected5 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '10000' },
      { timestamp: 1_700_000_000, balance: '30000' },
      { timestamp: 1_800_000_000, balance: '40000' },
      { timestamp: 1_900_000_000, balance: '60000' },
    ];
    expect(sumSchedules([schedule09, schedule10])).toStrictEqual(expected5);
  });
  it('should return expected6', () => {
    const expected6 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '60000' },
      { timestamp: 1_700_000_000, balance: '90000' },
    ];
    const schedule7 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ];
    expect(sumSchedules([schedule7, schedule7, schedule7])).toStrictEqual(expected6);
  });
  // if schedule1 passed returns this schedule
  it('handles schedule1 passed return schedule2', () => {
    const schedule2 = [
      { timestamp: 1_600_000_000, balance: '0' },
      { timestamp: 1_700_000_000, balance: '20000' },
    ];
    expect(sumSchedules([schedule2])).toStrictEqual(schedule2);
  });
});

describe('assertValidTerminationSchedule', () => {
  it('doesnt fail on same lockup schedule', () => {
    const schedule = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ];
    expect(() => assertValidTerminationSchedule(schedule, schedule)).not.toThrow();
  });
  it('doesnt fail on lagging vesting schedule', () => {
    const lockupSchedule = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ];
    let buildVestingSchedule = (offset: number) => {
      return [
        { timestamp: 1_500_000_000 + offset, balance: '0' },
        { timestamp: 1_600_000_000 + offset, balance: '20000' },
        { timestamp: 1_700_000_000 + offset, balance: '30000' },
      ];
    };
    expect(() => assertValidTerminationSchedule(lockupSchedule, buildVestingSchedule(-1))).not.toThrow();
    expect(() => assertValidTerminationSchedule(lockupSchedule, buildVestingSchedule(-50_000_000))).not.toThrow();
    expect(() => assertValidTerminationSchedule(lockupSchedule, buildVestingSchedule(-500_000_000))).not.toThrow();

    const vestingSchedule2 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_900_000_000, balance: '100000' },
    ];

    expect(() => assertValidTerminationSchedule(lockupSchedule, vestingSchedule2)).not.toThrow();
  });

  it('fails on leading lockup schedule', () => {
    const lockupSchedule = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ];
    let buildVestingSchedule = (offset: number) => {
      return [
        { timestamp: 1_500_000_000 + offset, balance: '0' },
        { timestamp: 1_600_000_000 + offset, balance: '20000' },
        { timestamp: 1_700_000_000 + offset, balance: '30000' },
      ];
    };
    let error = /is ahead of/;
    expect(() => assertValidTerminationSchedule(lockupSchedule, buildVestingSchedule(1))).toThrow(error);
    expect(() => assertValidTerminationSchedule(lockupSchedule, buildVestingSchedule(50_000_000))).toThrow(error);
    expect(() => assertValidTerminationSchedule(lockupSchedule, buildVestingSchedule(500_000_000))).toThrow(error);

    const vestingSchedule2 = [
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '25000' },
    ];

    expect(() => assertValidTerminationSchedule(lockupSchedule, vestingSchedule2)).toThrow(error);

    const vestingSchedule3 = [
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '15000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ];

    expect(() => assertValidTerminationSchedule(lockupSchedule, vestingSchedule3)).toThrow(error);
  });
});

describe('terminateSchedule', () => {
  const schedule = [
    { timestamp: 1_500_000_000, balance: '0' },
    { timestamp: 1_600_000_000, balance: '20000' },
    { timestamp: 1_700_000_000, balance: '30000' },
  ];

  it('before schedule', () => {
    expect(terminateSchedule(schedule, 1_400_000_000)).toStrictEqual([
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_500_000_001, balance: '0' },
    ]);
  });

  it('intermediate first segment', () => {
    expect(terminateSchedule(schedule, 1_525_000_000)).toStrictEqual([
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_525_000_000, balance: '5000' },
    ]);
  });

  it('midpoint', () => {
    expect(terminateSchedule(schedule, 1_600_000_000)).toStrictEqual([
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
    ]);
  });

  it('intermediate second segment', () => {
    expect(terminateSchedule(schedule, 1_625_000_000)).toStrictEqual([
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_625_000_000, balance: '22500' },
    ]);
  });

  it('after schedule end', () => {
    expect(terminateSchedule(schedule, 1_750_000_000)).toStrictEqual([
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ]);
  });
});

describe('terminateScheduleAtAmount', () => {
  const schedule = [
    { timestamp: 1_400_000_000, balance: '0' },
    { timestamp: 1_500_000_000, balance: '0' },
    { timestamp: 1_600_000_000, balance: '20000' },
    { timestamp: 1_700_000_000, balance: '30000' },
  ];

  it('before schedule', () => {
    expect(terminateScheduleAtAmount(schedule, '0', 1_350_000_000)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_400_000_001, balance: '0' },
    ]);
  });

  it('before schedule', () => {
    expect(terminateScheduleAtAmount(schedule, '0', 1_450_000_000)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_450_000_000, balance: '0' },
    ]);
  });

  it('intermediate first segment', () => {
    expect(terminateScheduleAtAmount(schedule, '5000', 1234567890)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_525_000_000, balance: '5000' },
    ]);
  });

  it('midpoint', () => {
    expect(terminateScheduleAtAmount(schedule, '20000', 1234567890)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
    ]);
  });

  it('intermediate second segment', () => {
    expect(terminateScheduleAtAmount(schedule, '22500', 123456789)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_625_000_000, balance: '22500' },
    ]);
  });

  it('after schedule end', () => {
    expect(terminateSchedule(schedule, 1_750_000_000)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ]);
  });

  const schedule2 = [
    { timestamp: 1_400_000_000, balance: '0' },
    { timestamp: 1_500_000_000, balance: '10000' },
    { timestamp: 1_600_000_000, balance: '10000' },
    { timestamp: 1_700_000_000, balance: '10000' },
    { timestamp: 1_800_000_000, balance: '20000' },
  ];

  it('with plateau clash', () => {
    expect(terminateScheduleAtAmount(schedule2, '10000', 1234567890)).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_500_000_000, balance: '10000' },
    ]);
  });
});

describe('shatterSchedule', () => {
  const schedule = [
    { timestamp: 1_500_000_000, balance: '0' },
    { timestamp: 1_600_000_000, balance: '20000' },
    { timestamp: 1_700_000_000, balance: '30000' },
  ];

  it('insert between', () => {
    expect(shatterSchedule(schedule, [
      1_400_000_000,
      1_750_000_000,
      1_625_000_000,
      1_525_000_000,
    ])).toStrictEqual([
      { timestamp: 1_400_000_000, balance: '0' },
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_525_000_000, balance: '5000' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_625_000_000, balance: '22500' },
      { timestamp: 1_700_000_000, balance: '30000' },
      { timestamp: 1_750_000_000, balance: '30000' },
    ]);
  });

  it('insert matching', () => {
    expect(shatterSchedule(schedule, [
      1_700_000_000,
      1_500_000_000,
      1_600_000_000,
    ])).toStrictEqual([
      { timestamp: 1_500_000_000, balance: '0' },
      { timestamp: 1_600_000_000, balance: '20000' },
      { timestamp: 1_700_000_000, balance: '30000' },
    ]);
  });
});
