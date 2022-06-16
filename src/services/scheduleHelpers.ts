// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const interpolate = (x0: number, y0: number, x1: number, y1: number, xM: number) => {
  if (x1 <= x0) {
    throw new Error('invalid range');
  }
  if (xM < x0 || xM >= x1) {
    throw new Error('xM out of bound');
  }

  return x0;
};
