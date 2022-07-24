import { formatTokenAmount } from './utils';

describe('formatTokenAmount', () => {
  it('works', () => {
    expect(formatTokenAmount('1000000000000', 6)).toStrictEqual('1000000.00');
    expect(formatTokenAmount('499999', 6)).toStrictEqual('0.49');
    expect(formatTokenAmount('1000', 0)).toStrictEqual('1000.00');
    expect(formatTokenAmount('1000', 1)).toStrictEqual('100.00');
    expect(formatTokenAmount('1000', 2)).toStrictEqual('10.00');
    expect(formatTokenAmount('1000', 3)).toStrictEqual('1.00');
    expect(formatTokenAmount('1000', 4)).toStrictEqual('0.10');
    expect(formatTokenAmount('1000', 5)).toStrictEqual('0.01');
    expect(formatTokenAmount('1000', 6)).toStrictEqual('0.00');
  });
});
