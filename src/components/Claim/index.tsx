import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';

function ClaimAllLockups(params: { accountId: string | undefined, token: TMetadata, total: String }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { accountId, token, total } = params;

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (!accountId) {
    throw Error('Undefined account cannot claim');
  }

  const handleClaimAllLockups = () => {
    near.noLoginApi.claim(accountId);
  };

  return (
    <div className="claim-wrapper">
      <h5>Total available</h5>
      <div className="claim-amount">
        {total}
        <span>{token.symbol}</span>
      </div>
      <button className="button" type="button" onClick={handleClaimAllLockups}>Claim All</button>
    </div>
  );
}

export default ClaimAllLockups;
