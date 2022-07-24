import Big from 'big.js';
import { config } from './config';

export const MAX_GAS = 300_000_000_000_000;
export const ONE_YOCTO = 1;

Big.DP = 40;
Big.PE = 40;
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

// formats token amount, always two digits after comma, fixed, no group separators
export const formatTokenAmount = (value: string, tokenDecimals: number) => new Big(value).div(10 ** tokenDecimals).toFixed(NEAR_ROUND_DIGITS, Big.roundDown);

// @ts-ignore
export const addYear = (date: Date, year: number) => new Date(new Date(date).setFullYear((date.getFullYear()) + year)).getTime() / 1000;
export const startOfDay = (date: Date) => {
  const msInDay = 1_000 * 60 * 60 * 24;
  const result = new Date(Math.floor(date.getTime() / msInDay) * msInDay);

  return result;
};
export const addDays = (date: Date, days: number) => {
  const msInDay = 1_000 * 60 * 60 * 24;
  const result = new Date(date.getTime() + msInDay * days);

  return result;
};

export const dumpLocalStorage = (dumpKey: string = 'dump') => {
  const dumpValue = Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]);

  localStorage.setItem(dumpKey, JSON.stringify(dumpValue));
};

export const restoreLocalStorage = (dumpKey: string = 'dump') => {
  const data = localStorage.getItem(dumpKey);

  if (!data) {
    return;
  }

  const dumpValue = JSON.parse(data);

  localStorage.clear();

  dumpValue.forEach((record:string[]) => localStorage.setItem(record[0], record[1]));
};

export const txLinkInExplorer = (txHash: string) => `${config.explorerUrl}/transactions/${txHash}`;
