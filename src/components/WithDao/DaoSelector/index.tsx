import { useContext } from 'react';

import Select from '@mui/material/Select';

import {
  TextField,
  InputLabel,
  MenuItem,
} from '@mui/material';

import { INearProps, NearContext } from '../../../services/near';

type TProps = {
  selectedAddress: string,
  setSelectedAddress: Function,
};

function DaoSelector({ selectedAddress, setSelectedAddress }: TProps): any {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  const { daos } = near.currentUser;

  if (daos.length > 0 && selectedAddress === '') {
    setSelectedAddress(daos[0]);
  }

  const handleSelectedDaoAddressChange = (event: any) => {
    setSelectedAddress(event.target.value as string);
  };

  if (daos.length > 0) {
    return (
      <div>
        <InputLabel>Select DAO contract address</InputLabel>
        <Select
          required
          sx={{ marginBottom: 3, width: 1 }}
          value={selectedAddress}
          onChange={handleSelectedDaoAddressChange}
        >
          {daos.map((dao) => <MenuItem value={dao}>{dao}</MenuItem>)}
        </Select>
      </div>
    );
  }

  return (
    <TextField
      required
      sx={{ marginBottom: 3, width: 1 }}
      id="outlined-helperText"
      label="DAO contract address"
      onChange={handleSelectedDaoAddressChange}
    />
  );
}

export default DaoSelector;
