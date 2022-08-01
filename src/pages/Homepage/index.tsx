import { Box, InputAdornment, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

import useTitle from '../../services/useTitle';
import { DEFAULT_CONTRACT_NAME } from '../../config';

export default function Homepage() {
  useTitle('Welcome | FT Lockup', { restoreOnUnmount: true });

  const [address, setAddress] = useState(DEFAULT_CONTRACT_NAME);
  const [error, setError] = useState('');
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setError('');
  };
  const navigate = useNavigate();

  const handleOpenLockupContract = () => {
    if (!address || address.length < 5) {
      setError('length should be more than 5 symbols');
      return;
    }
    if (!address.match(/^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+\.(testnet|near)$/)) {
      setError('address should be for NEAR network');
      return;
    }
    setError('');
    const url = `/${address}/lockups`;
    navigate(url);
    window.location.reload();
  };

  return (
    <div className="root">
      <div className="header">
        <div className="container">
          <Box sx={{ display: 'flex' }}>
            <Link className="logo" to="/">LOCKUPS</Link>
          </Box>
        </div>
      </div>
      <div className="main">
        <div className="container home">

          <h2>Manage token vesting on NEAR</h2>
          <h5>Create new lockup contract to be used by startup</h5>

          <Link to="/new_lockup_contract" className="button link-button">Create Lockup Contract</Link>

          <div className="line" />

          <div className="search-container">
            <TextField
              variant="outlined"
              value={address}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleOpenLockupContract();
                }
              }}
              className="input large"
              placeholder="Enter existing Lockup contract address"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              error={!!error}
              helperText={error}
            />
            <button className="button" onClick={handleOpenLockupContract} aria-label="open" type="button">
              Search
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
