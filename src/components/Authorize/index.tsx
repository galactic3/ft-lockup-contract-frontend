import { Alert, Button } from '@mui/material';
import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';

function Auth({ children }: { children: ReactNode }) {
  return (
    <div className="container">
      <div className="login">
        <h2>To start using app, please sign in</h2>
        {children}
      </div>
    </div>
  );
}

function Authorize() {
  const {
    near, signIn,
  }: {
    near: INearProps | null, signIn: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const {
    signedIn, isAdmin, isCouncilMember, isDraftOperator,
  } = near.currentUser;

  const showAlertForUser = signedIn && !(isAdmin || isCouncilMember || isDraftOperator);
  const showLockups = signedIn && (isAdmin || isCouncilMember || isDraftOperator);

  return (
    <Auth>
      { showAlertForUser && <Alert severity="error">You are not admin</Alert>}
      { !signedIn && <Button variant="contained" className="button" type="button" onClick={signIn}>Sign In</Button> }
      { showLockups && <Navigate to="lockups" replace />}
    </Auth>
  );
}
export default Authorize;
