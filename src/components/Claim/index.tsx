import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import TokenAmountPreview from '../TokenAmountPreview';

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
      <TokenAmountPreview token={token} amount={total} />
      <button className="button fullWidth" type="button" onClick={handleClaimAllLockups}>Claim All</button>
    </div>
  );
}

export default ClaimAllLockups;
