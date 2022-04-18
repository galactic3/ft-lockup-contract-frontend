import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';

function Auth({ children }: { children: ReactNode }) {
  return <div className="container">{children}</div>;
}

function Authorize() {
  const {
    near, signIn,
  }: {
    near: INearProps | null, signIn: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn } = near;

  const handleSignIn = async () => {
    signIn();
  };

  if (signedIn) {
    return (
      <Navigate to="/admin/lockups" replace />
    );
  }

  return (
    <Auth>
      <button className="button" type="button" onClick={handleSignIn}>Sign In</button>
    </Auth>
  );
}
export default Authorize;
