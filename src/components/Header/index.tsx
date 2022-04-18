import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Box } from '@mui/material';
import { INearProps, NearContext } from '../../services/near';

export default function Header() {
  const {
    near, signOut,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn, signedAccountId } = near;

  return (
    <div className="header">
      <div className="container">
        {signedIn ? (
          <Box sx={{ display: 'flex' }}>
            <div className="nav">
              <Link className="nav-link" to="admin/lockups">Lockups</Link>
              <Link className="nav-link" to="/about">About</Link>
            </div>
            <Box sx={{ marginTop: '3px' }}>
              <span>
                {signedAccountId}
                {' '}
              </span>
              <button className="button" type="button" onClick={signOut}>Log out</button>
            </Box>
          </Box>
        ) : (
          <div className="nav">
            <Link className="nav-link" to="/lockups">Lockups</Link>
            <Link className="nav-link" to="/about">About</Link>
          </div>
        )}
      </div>
    </div>
  );
}
