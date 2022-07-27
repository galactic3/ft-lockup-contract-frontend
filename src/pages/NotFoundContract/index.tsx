import { Box, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useTitle from '../../services/useTitle';

export default function NotFoundContract() {
  useTitle('Not Found | FT Lockup', { restoreOnUnmount: true });
  const location = useLocation();
  const navigate = useNavigate();
  const currentContractName = location.pathname.split('/')[1];

  const [address, setAddress] = useState(currentContractName);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

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
      <div className="container not_found">
        <div className="search-container">
          <TextField
            variant="outlined"
            value={address}
            onChange={handleChange}
            className="input fullWidth"
            placeholder="Enter existing Lockup contract address"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <button className="button large" onClick={handleOpenLockupContract} aria-label="open" type="button">
            Search
          </button>
        </div>

        <div className="block">
          <p className="right_part">
            Contract
            {' '}
            <span className="red">{currentContractName}</span>
            {' '}
            not found.
          </p>

          <div className="left_part">
            <Link to="/new_lockup_contract" className="button link-button">Create Lockup Contract</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
