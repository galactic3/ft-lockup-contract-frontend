import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Box } from '@mui/material';
import { INearProps, NearContext } from '../../services/near';

export default function Header({ adminControls }: { adminControls: boolean }) {
  const {
    near, signOut,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn, signedAccountId, isAdmin } = near;

  return (
    <div className="header">
      <div className="container">
        <Box sx={{ display: 'flex' }}>
          <div className="nav">
            <Link className="nav-link" to={adminControls && isAdmin ? '/admin/lockups' : '/lockups'}>Lockups</Link>
            <Link className="nav-link" to={adminControls ? '/admin/about' : '/about'}>About</Link>
            {adminControls && (<Link className="nav-link" to="/admin/draft_groups">Draft Groups</Link>)}
          </div>
          {adminControls && signedIn && (
            <Box sx={{ marginTop: '23px' }}>
              <span>
                {signedAccountId}
                {' '}
              </span>
              <button className="button" type="button" onClick={signOut}>Log out</button>
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
}
