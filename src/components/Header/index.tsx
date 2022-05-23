import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Box } from '@mui/material';
import { INearProps, NearContext } from '../../services/near';
import { CONTRACT_NAME } from '../../config';

export default function Header({ adminControls }: { adminControls: boolean }) {
  const {
    near, signOut,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  console.log(CONTRACT_NAME);

  const { signedIn, signedAccountId, isAdmin } = near;

  return (
    <div className="header">
      <div className="container">
        <Box sx={{ display: 'flex' }}>
          <div className="nav">
            <Link className="nav-link" to={adminControls && isAdmin ? `/${CONTRACT_NAME}/admin/lockups` : `/${CONTRACT_NAME}/lockups`}>Lockups</Link>
            <Link className="nav-link" to={adminControls ? `/${CONTRACT_NAME}/admin/about` : `/${CONTRACT_NAME}/about`}>About</Link>
            {adminControls && (<Link className="nav-link" to={`/${CONTRACT_NAME}/admin/draft_groups`}>Drafts</Link>)}
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
