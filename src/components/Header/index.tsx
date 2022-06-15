import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Box } from '@mui/material';
import { INearProps, NearContext } from '../../services/near';

export default function Header({ adminControls }: { adminControls: boolean }) {
  const location = useLocation();
  const currentContractName = location.pathname.split('/')[1];

  const {
    near, signOut,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const {
    signedIn,
    signedAccountId,
    isAdmin,
    isCouncilMember,
  } = near.currentUser;

  const lockupsPageViewPolicy = adminControls && (isAdmin || isCouncilMember);

  return (
    <div className="header">
      <div className="container">
        <Box sx={{ display: 'flex' }}>
          <div className="nav">
            <Link className="nav-link" to={lockupsPageViewPolicy ? `/${currentContractName}/admin/lockups` : `/${currentContractName}/lockups`}>Lockups</Link>
            <Link className="nav-link" to={adminControls ? `/${currentContractName}/admin/about` : `/${currentContractName}/about`}>About</Link>
            {adminControls && (<Link className="nav-link" to={`/${currentContractName}/admin/draft_groups`}>Drafts</Link>)}
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
