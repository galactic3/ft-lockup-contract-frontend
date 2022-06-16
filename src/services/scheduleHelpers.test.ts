import { interpolate } from './scheduleHelpers';

describe('1 test', () => {
  it('test interpolate doesn\'t throw', () => {
    interpolate(1_500_000_000, 10_000, 1_700_000_000, 14_000, 1_550_000_000);
  });
});
