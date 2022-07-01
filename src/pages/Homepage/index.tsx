import { Box, InputAdornment, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { DEFAULT_CONTRACT_NAME } from '../../config';

export default function Homepage(
  { lockups }: { lockups: any[] },
) {
  const [address, setAddress] = useState(DEFAULT_CONTRACT_NAME);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const navigate = useNavigate();

  const handleOpenLockupContract = () => {
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

          <ul className="home-list">
            <li>
              <div>
                <span>Total contracts</span>
                <b>256</b>
              </div>
            </li>
            <li>
              <div>
                <span>Total locked</span>
                <b>$5,336,000</b>
              </div>
            </li>
            <li>
              <div>
                <span>Total lockups</span>
                <b>{lockups?.length || 42}</b>
              </div>
            </li>
          </ul>

          <h2>Manage token vesting on NEAR</h2>
          <p>Create new lockup contract to be used by startup</p>

          <Link to="/new_lockup_contract" className="button link-button">Create Lockup Contract</Link>

          <div className="line" />

          <div className="search-container">
            <TextField
              variant="outlined"
              value={address}
              onChange={handleChange}
              className="input"
              placeholder="Enter existing Lockup contract address"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
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
