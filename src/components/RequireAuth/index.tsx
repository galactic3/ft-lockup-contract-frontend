import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';
import PayForContractStorage from '../PayForContractStorage';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const {
    near,
  }: {
    near: INearProps | null, signIn: () => void, signOut: () => void,
  } = useContext(NearContext);
  if (!near) return null;
  const { signedIn, isAdmin, isCouncilMember } = near.currentUser;
  const currentPathname = location.pathname;
  const currentContractName = location.pathname.split('/')[1];
  const currentPathWithoutContract = location.pathname.split(currentContractName)[1];
  const draftGroupURL = currentPathWithoutContract.includes('/draft');

  if (!signedIn || !(isAdmin || isCouncilMember)) {
    if (draftGroupURL) {
      return <Navigate to={currentPathname.replace(/\/admin/, '')} replace />;
    }
    return <Navigate to={`/${currentContractName}/admin`} replace />;
  }

  if (!near.isContractFtStoragePaid) {
    return (
      <div className="container">
        <PayForContractStorage />
      </div>
    );
  }

  return children;
}
