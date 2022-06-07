import { useContext, useState } from 'react';

import ConfirmDialog from '../ConfirmDialog';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import TokenAmountPreview from '../TokenAmountPreview';

function ClaimAllLockups(params: { accountId: string | undefined, token: TMetadata, total: String }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { accountId, token, total } = params;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogConfirmCallback, setDialogConfirmCallback] = useState<any>(() => null);
  const closeDialog = () => setIsDialogOpen(false);
  const openDialog = () => setIsDialogOpen(true);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (!accountId) {
    throw Error('Undefined account cannot claim');
  }

  const handleClaimAllLockups = () => {
    const perform = async () => {
      if (!near) return;
      if (!near.tokenApi) return;
      if (!near.noLoginTokenApi) return;
      if (!near.tokenContractId) return;

      const storageBalance = await near.tokenApi.storageBalanceOf(accountId);
      const isStoragePaid = (storageBalance !== null) && true;
      if (isStoragePaid) {
        near.noLoginApi.claim(accountId);
      } else {
        const bounds = await near.tokenApi.storageBalanceBounds();
        const amount = bounds.max;

        debugger;
        const callback = () => {
          near.noLoginTokenApi.storageDeposit(near.tokenContractId, accountId, amount);
        };
        setDialogConfirmCallback(() => callback);
        openDialog();
      }
    };

    perform();
  };

  const depositConfirmMessage = `
    Your account doesn't have storage deposit on the token contract. You will be redirected to pay for the storage, after that you will be able to claim your tokens.
  `.trim();

  return (
    <div className="claim-wrapper">
      <h5>Total available</h5>
      <TokenAmountPreview token={token} amount={total} />
      <button className="button fullWidth" type="button" onClick={handleClaimAllLockups}>Claim All</button>
      <ConfirmDialog message={depositConfirmMessage} isOpen={isDialogOpen} closeFn={closeDialog} callback={dialogConfirmCallback} />
    </div>
  );
}

export default ClaimAllLockups;
