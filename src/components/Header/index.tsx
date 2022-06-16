import { Link, NavLink, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
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

  useEffect(() => {
    console.log(location.pathname);

    return () => {};
  }, [location]);

  if (!near) return null;

  const { signedIn, signedAccountId, isAdmin } = near;

  return (
    <div className="header">
      <div className="container">
        <Box sx={{ display: 'flex' }}>
          <Link className="logo" to="/">LOCKUPS</Link>
          <div className="nav">
            <NavLink className="nav-link" to={adminControls && isAdmin ? `/${currentContractName}/admin/lockups` : `/${currentContractName}/lockups`}>Lockups</NavLink>
            <NavLink className="nav-link" to={adminControls ? `/${currentContractName}/admin/about` : `/${currentContractName}/about`}>About</NavLink>
            {adminControls && (<NavLink className="nav-link" to={`/${currentContractName}/admin/draft_groups`}>Drafts</NavLink>)}
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
