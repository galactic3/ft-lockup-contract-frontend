import { Box, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { ChangeEvent, useState } from 'react';
import { ReactComponent as Logo } from '../../assets/images/near.svg';
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
              <span className="near-icon-bg"><Logo /></span>
              <div>
                <span>Total contracts</span>
                <b>256</b>
              </div>
            </li>
            <li>
              <span className="near-icon-bg"><Logo /></span>
              <div>
                <span>Total locked</span>
                <b>$5,336,000</b>
              </div>
            </li>
            <li>
              <span className="near-icon-bg"><Logo /></span>
              <div>
                <span>Total lockups</span>
                <b>{lockups?.length || 42}</b>
              </div>
            </li>
          </ul>

          <h2>The best DApp on NEAR to manage token vesting</h2>
          <p>With our lockup contracts you can ....</p>

          <Link to="/new_lockup_contract" className="button large link-button">Create new Lockup Contract</Link>

        </div>
        <div className="white-block">
          <div className="container home">
            <h2>If you already have a lockup contract, enter its address below</h2>
            <TextField variant="outlined" value={address} onChange={handleChange} className="input-large" placeholder="Lockup contract address" />
            <button className="button link-button icon-button" onClick={handleOpenLockupContract} aria-label="open" type="button" style={{ height: 56, width: 56 }}>
              <ArrowForwardRoundedIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
