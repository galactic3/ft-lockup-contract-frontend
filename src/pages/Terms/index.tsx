import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import useTitle from '../../services/useTitle';

export default function Terms() {
  useTitle('Terms | FT Lockup', { restoreOnUnmount: true });

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
        <div className="container">
          <h1>Terms</h1>

        </div>
      </div>
    </div>
  );
}
