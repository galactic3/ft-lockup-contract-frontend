import Big from 'big.js';

Big.DP = 40;
export const NEAR_ROUND_DIGITS = 2;

export const toNear = (value: any) => Big(value).times(10 ** 24).round(0, Big.roundDown);
export const nearTo = (value: any, digits = NEAR_ROUND_DIGITS, mode?: number | undefined) => {
  // default is 20, need at least 38 for proper rounding of any near balance
  Big.DP = 40;
  return Big(value || '0').div(10 ** 24).toFixed(digits === 0 ? undefined : digits, mode);
};
export const nearToCeil = (
  value: any,
  digits = NEAR_ROUND_DIGITS,
) => nearTo(value, digits, Big.roundUp);
export const nearToFloor = (
  value: any,
  digits = NEAR_ROUND_DIGITS,
) => nearTo(value, digits, Big.roundDown);
export const big = (value = '0') => Big(value);
export const tsNear2JS = (time: number) => Math.floor(time / 1000000);
export const convertTimestamp = (time: number) => new Date(time * 1000).toLocaleDateString('en-US');
export const convertAmount = (value: number) => Math.floor(value / 100000);
// @ts-ignore
// eslint-disable-next-line max-len
export const addYear = (date: Date | null, year: number) => new Date(date?.setFullYear((date?.getFullYear() || 0) + year)).getTime() / 1000;
