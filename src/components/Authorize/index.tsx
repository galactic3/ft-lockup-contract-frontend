import { Alert } from '@mui/material';
import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';

function Auth({ children }: { children: ReactNode }) {
  return <div className="container login">{children}</div>;
}

function Authorize() {
  const {
    near, signIn,
  }: {
    near: INearProps | null, signIn: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn, isAdmin, isCouncilMember } = near;

  const showAlertForUser = signedIn && !(isAdmin || isCouncilMember);
  const showLockups = signedIn && (isAdmin || isCouncilMember);

  return (
    <Auth>
      { showAlertForUser && <Alert sx={{ margin: 2, width: '500px' }} severity="error">You are not admin</Alert>}
      { !signedIn && <button className="button" type="button" onClick={signIn}>Sign In</button> }
      { showLockups && <Navigate to="lockups" replace />}
    </Auth>
  );
}
export default Authorize;
