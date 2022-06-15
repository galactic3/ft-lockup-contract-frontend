import {
  TextField,
} from '@mui/material';

import { useRef } from 'react';

export default function FavouriteAccounts({ favouriteAccounts, uniqueUsers, onSave }: { favouriteAccounts:string[], uniqueUsers: string[], onSave: Function }) {
  console.log('unique users', uniqueUsers);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const handleSaveFavouriteAccounts = (): void => {
    debugger;
    if (!inputRef?.current?.value) {
      return;
    }
    const newFavouriteAccounts = inputRef.current.value.replaceAll(' ', '').split(',');
    onSave(newFavouriteAccounts);
    localStorage.setItem('favouriteAccounts', JSON.stringify(newFavouriteAccounts));
  };

  return (
    <div className="container">
      <TextField
        sx={{ marginBottom: 3, width: 1 }}
        id="outlined-helperText"
        label="Favourite accounts"
        defaultValue={favouriteAccounts.join(', ')}
        inputRef={inputRef}
      />
      <button className="button noMargin" type="button" onClick={handleSaveFavouriteAccounts}>save</button>
    </div>
  );
}
