import { interpolate, interpolateRaw } from './scheduleHelpers';

describe('1 test', () => {
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

describe('1 test', () => {
  it('returns valid intermediate value', () => {
    expect(interpolate(
      { timestamp: 1_500_000_000, balance: '10000' },
      { timestamp: 1_700_000_000, balance: '14000' },
      1_550_000_000,
    )).toStrictEqual({ timestamp: 1_550_000_000, balance: '11000' });
  });
});
