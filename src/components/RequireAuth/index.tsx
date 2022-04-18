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

  const { signedIn } = near;

  if (!signedIn) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}
