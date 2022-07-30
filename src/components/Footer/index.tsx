import {
  Link, useLocation,
} from 'react-router-dom';
import { useContext } from 'react';
import { Box } from '@mui/material';
import { INearProps, NearContext } from '../../services/near';

import '../../styles/footer.scss';

export default function Footer() {
  const location = useLocation();
  const currentPathname = location.pathname;
  const isAdminView = location.pathname.includes('admin');
  const pathname = location.pathname.replace(/\/*$/, '');
  const showSwitch = !['', '/terms', '/privacy', '/about', '/new_lockup_contract'].some((x) => pathname === x);

  const index = currentPathname.indexOf('/', 1);
  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  if (!near) return null;

  let updatedPathname = `${currentPathname.substring(0, index)}/admin${currentPathname.substring(index, currentPathname.length)}`;
  if (
    currentPathname.substring(index, currentPathname.length).includes('/draft_groups')
    && !(
      near.currentUser.isAdmin || near.currentUser.isCouncilMember || near.currentUser.isDraftOperator
    )
  ) {
    updatedPathname = `${currentPathname.substring(0, index)}/admin`;
  }

  const viewSwitchLink = isAdminView
    ? <Link className="nav-link" to={currentPathname.replace(/\/admin/, '')}>User view</Link>
    : <Link className="nav-link" to={updatedPathname}>Admin view</Link>;

  return (
    <div className="footer">
      <div className="container">
        <Box sx={{ display: 'flex' }}>
          <div className="nav">
            <Link className="nav-link" to="/about">About</Link>
            <Link className="nav-link" to="/terms">Terms</Link>
            <Link className="nav-link" to="/privacy">Privacy</Link>
            {showSwitch && viewSwitchLink}
          </div>
        </Box>
      </div>
    </div>
  );
}
Footer.defaultProps = { showSwitch: true };
