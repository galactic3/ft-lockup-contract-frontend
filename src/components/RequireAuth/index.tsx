import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const {
    near,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn, isAdmin } = near;

  const currentContractName = location.pathname.split('/')[1];

  if (!signedIn || !isAdmin) {
    return <Navigate to={`/${currentContractName}/admin`} replace />;
  }

  return children;
}
