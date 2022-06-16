import {
  TextField,
} from '@mui/material';

import { useRef } from 'react';

export default function FavouriteAccounts({ favouriteAccounts, uniqueUsers, onSave }: { favouriteAccounts:string[], uniqueUsers: string[], onSave: Function }) {
  console.log('unique users', uniqueUsers);

  const inputRef = useRef<null | HTMLInputElement>(null);

  const handleSaveFavouriteAccounts = (): void => {
    if (!inputRef?.current?.value) {
      localStorage.setItem('favouriteAccounts', '[]');
      onSave([]);
      return;
    }

    const newFavouriteAccounts = inputRef.current.value.replaceAll(' ', '').split(',');
    onSave(newFavouriteAccounts);
    localStorage.setItem('favouriteAccounts', JSON.stringify(newFavouriteAccounts));
  };

  return (
    <div style={{ display: 'flex', marginBottom: '2em' }}>
      <TextField
        inputProps={{
          sx: {
            padding: 1.4,
            margin: 0,
          },
        }}
        sx={{ width: 1, padding: 0, margin: 0 }}
        id="outlined-helperText"
        label="My accounts"
        placeholder="Comma separated list of your near accounts"
        defaultValue={favouriteAccounts.join(', ')}
        inputRef={inputRef}
        onKeyPress={(e) => e.key === 'Enter' && handleSaveFavouriteAccounts()}
      />
    </div>
  );
}