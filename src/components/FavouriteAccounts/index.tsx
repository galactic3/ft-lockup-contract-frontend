import {
  TextField,
} from '@mui/material';

import { useRef } from 'react';

export default function FavouriteAccounts({
  tokenContractId, favouriteAccounts, uniqueUsers, onSave,
}: {
  tokenContractId: string, favouriteAccounts: string[], uniqueUsers: string[], onSave: Function,
}) {
  console.log('unique users', uniqueUsers);

  const inputRef = useRef<null | HTMLInputElement>(null);

  const parseAccounts = (input: string): string[] => input.replaceAll(' ', '').split(',');

  const handleSaveFavouriteAccounts = (): void => {
    const localStorageValue = (value: string[]): string => JSON.stringify({ favouriteAccounts: value });

    if (!inputRef?.current?.value) {
      localStorage.setItem(tokenContractId, localStorageValue([]));
      onSave([]);
      return;
    }

    const newFavouriteAccounts = parseAccounts(inputRef.current.value);
    onSave(newFavouriteAccounts);
    localStorage.setItem(tokenContractId, localStorageValue(newFavouriteAccounts));
  };

  const handleChangeFavouriteAccounts = (e: any) => {
    const { value } = e.target;

    const realAccouns = parseAccounts(value).filter((account) => account.match(/.*(\.)(near|testnet)$/));

    if (favouriteAccounts.toString() !== realAccouns.toString()) {
      handleSaveFavouriteAccounts();
    }
  };

  return (
    <div style={{ display: 'flex', marginBottom: '2em' }}>
      <TextField
        inputProps={{
          sx: {
            margin: 0,
          },
        }}
        size="small"
        sx={{ width: 1, padding: 0, margin: 0 }}
        id="outlined-helperText"
        label="My accounts"
        placeholder="Comma separated list of your near accounts"
        defaultValue={favouriteAccounts.join(', ')}
        inputRef={inputRef}
        onKeyPress={(e) => e.key === 'Enter' && handleSaveFavouriteAccounts()}
        onChange={handleChangeFavouriteAccounts}
      />
    </div>
  );
}
