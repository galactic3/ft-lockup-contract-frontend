import { foo } from './scheduleHelpers';

describe('1 test', () => {
  it('test sum', () => {
    expect(foo).toStrictEqual(42);
  });
});
