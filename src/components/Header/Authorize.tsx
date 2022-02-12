import { Dispatch, ReactNode } from 'react';
import { INearProps } from '../../services/near';

function Auth({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Authorize(
  { near, setNear }: { near: INearProps | null, setNear: Dispatch<INearProps | null> },
) {
  if (!near) return null;

  const { api, signedIn, signedAccountId } = near;

  const handleSignIn = async () => {
    api.signIn();
  };

  const handleSignOut = async () => {
    api.signOut();
    setNear({
      ...near,
      signedIn: false,
      signedAccountId: null,
    });
  };

  if (signedIn) {
    return (
      <Auth>
        <div>{signedAccountId}</div>
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
