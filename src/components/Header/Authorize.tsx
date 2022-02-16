import { ReactNode, useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function Auth({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Authorize() {
  const {
    near, signIn, signOut,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn, signedAccountId } = near;

  const handleSignIn = async () => {
    signIn();
  };

  const handleSignOut = async () => {
    signOut();
  };

  if (signedIn) {
    return (
      <Auth>
        <span>{signedAccountId}</span>
        {' '}
        <button type="button" onClick={handleSignOut}>Log out</button>
      </Auth>
    );
  }

  return (
    <Auth>
      <button type="button" onClick={handleSignIn}>Sign In</button>
    </Auth>
  );
}
export default Authorize;
