import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function ClaimAllLockups(params: { accountId: string | undefined }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { accountId } = params;

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (!accountId) {
    throw Error('Undefined account cannot claim');
  }

  const handleClaimAllLockups = () => {
    near.api.claim(accountId);
  };

  return (
    <button className="button" type="button" onClick={handleClaimAllLockups}>Claim All</button>
  );
}

export default ClaimAllLockups;
