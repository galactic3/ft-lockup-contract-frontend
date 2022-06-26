import { useContext, useState } from 'react';

import Select from '@mui/material/Select';

import {
  TextField,
  InputLabel,
  MenuItem,
} from '@mui/material';

import { INearProps, NearContext } from '../../../services/near';

function DaoSelector(): any {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  const { daos } = near.currentUser;

  const defaultDao: string = daos.length > 0 ? daos[0] || '' : '';

  const [astroDAOContractAddress, setAstroDAOContractAddress] = useState(defaultDao);

  const handleContractAddressChange = (event: any) => {
    setAstroDAOContractAddress(event.target.value as string);
  };

  if (daos.length > 0) {
    return (
      <div>
        <InputLabel>Select DAO contract address</InputLabel>
        <Select
          required
          sx={{ marginBottom: 3, width: 1 }}
          value={astroDAOContractAddress}
          onChange={handleContractAddressChange}
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
      onChange={handleContractAddressChange}
    />
  );
}

export default DaoSelector;
