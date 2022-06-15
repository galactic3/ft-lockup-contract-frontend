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
    <div style={{ display: 'flex' }}>
      <TextField
        sx={{ marginBottom: 3, width: 1, paddingRight: 2 }}
        id="outlined-helperText"
        label="Favourite accounts"
        defaultValue={favouriteAccounts.join(', ')}
        inputRef={inputRef}
        onKeyPress={(e) => e.key === 'Enter' && handleSaveFavouriteAccounts()}
      />
      <button className="button noMargin" type="button" onClick={handleSaveFavouriteAccounts}>save</button>
    </div>
  );
}
