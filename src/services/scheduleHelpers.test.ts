import { interpolate } from './scheduleHelpers';

describe('1 test', () => {
  it('test interpolate doesn\'t throw', () => {
    interpolate(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_550_000_000);
  });
  it('raises error if invalid input', () => {
    expect(() => interpolate(
      1_800_000_000,
      10_000,
      1_700_000_000,
      14_000,
      1_550_000_000,
    )).toThrow('invalid range');
    expect(() => interpolate(
      1_500_000_000,
      10_000,
      1_700_000_000,
      14_000,
      1_450_000_000,
    )).toThrow('xM out of bound');
    expect(() => interpolate(
      1_500_000_000,
      10_000,
      1_700_000_000,
      14_000,
      1_750_000_000,
    )).toThrow('xM out of bound');
  });
  it('returns starting value at the beginning of range', () => {
    expect(interpolate(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_500_000_000)).toStrictEqual(10_000);
  });
  it('returns valid intermediate value', () => {
    expect(interpolate(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_550_000_000)).toStrictEqual(11_000);
  });
});
