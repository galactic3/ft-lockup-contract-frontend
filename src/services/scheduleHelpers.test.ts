import { interpolate, interpolateRaw, interpolateSchedule } from './scheduleHelpers';

describe('interpolateRaw test', () => {
  it('test interpolate doesn\'t throw', () => {
    interpolateRaw(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_550_000_000);
  });
  it('raises error if invalid input', () => {
    expect(() => interpolateRaw(
      1_800_000_000,
      10_000,
      1_700_000_000,
      14_000,
      1_550_000_000,
    )).toThrow('invalid range');
    expect(() => interpolateRaw(
      1_500_000_000,
      10_000,
      1_700_000_000,
      14_000,
      1_450_000_000,
    )).toThrow('xM out of bound');
    expect(() => interpolateRaw(
      1_500_000_000,
      10_000,
      1_700_000_000,
      14_000,
      1_750_000_000,
    )).toThrow('xM out of bound');
  });
  it('returns starting value at the beginning of range', () => {
    expect(interpolateRaw(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_500_000_000)).toStrictEqual(10_000);
  });
  it('returns valid intermediate value', () => {
    expect(interpolateRaw(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_550_000_000)).toStrictEqual(11_000);
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
    const timestamp = 1_450_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp,
    )).toStrictEqual({ timestamp, balance: '0' });
  });
  // if timestamp after schedule stamp returns last checkpoint
  it('handles timestamp after schedule', () => {
    const timestamp = 1_950_000_000;
    expect(interpolateSchedule(
      schedule,
      timestamp,
    )).toStrictEqual({ timestamp, balance: '60000' });
  });
  it('works', () => {
    // if timestamp matches checkpoint from schedule return checkpoint from schedule
    // if between two checkpoints returns interpolated value
  });
});
