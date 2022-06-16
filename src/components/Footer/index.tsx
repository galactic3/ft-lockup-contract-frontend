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

  const index = currentPathname.indexOf('/', 1);
  const updatedPathname = `${currentPathname.substring(0, index)}/admin${currentPathname.substring(index, currentPathname.length)}`;

  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  if (!near) return null;

  return (
    <div className="footer">
      <div className="container">
        <Box sx={{ display: 'flex' }}>
          <div className="nav">
            <Link className="nav-link" to="/terms">Terms</Link>
            <Link className="nav-link" to="/privacy">Privacy</Link>
            {isAdminView ? <Link className="nav-link" to={currentPathname.replace(/\/admin/, '')}>User view</Link>
              : <Link className="nav-link" to={updatedPathname}>Admin view</Link>}
          </div>
        </Box>
      </div>
    </div>
  );
}
