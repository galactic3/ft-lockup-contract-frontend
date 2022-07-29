import { createContext } from 'react';

export type TSuggestContext = {
  open: boolean,
  setOpen: (newValue: boolean) => any,
};

export const SuggestContext = createContext<TSuggestContext>({
  open: false,
  setOpen: () => null,
});
