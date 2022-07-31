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
  const [error, setError] = useState('');
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setError('');
  };

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
      <div className="container not_found">
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
            className="input fullWidth"
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
            not found or is not correctly configured.
          </p>

          <div className="left_part">
            <Link to="/new_lockup_contract" className="button link-button">Create Lockup Contract</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
