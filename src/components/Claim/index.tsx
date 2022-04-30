import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import TokenIcon from '../TokenIcon';

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
      <div className="info-block" style={{ display: 'flex' }}>
        <div style={{ flex: 1, alignContent: 'center' }} className="claim-amount">
          <div className="token-symbol">
            {token.symbol}
          </div>
          <div className="token-amount">
            {total}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <TokenIcon url={token.icon || ''} size={64} />
        </div>
      </div>
      <button className="button fullWidth" type="button" onClick={handleClaimAllLockups}>Claim All</button>
    </div>
  );
}

export default ClaimAllLockups;
