import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';

import useTitle from '../../services/useTitle';
import { FACTORY_CONTRACT_NAME } from '../../config';
import { INearProps, NearContext } from '../../services/near';

export default function NewLockupContract() {
  useTitle('Create Lockup Contract | FT Lockup', { restoreOnUnmount: true });

  const { enqueueSnackbar } = useSnackbar();
  const { near, signIn }: { near: INearProps | null, signIn: () => void } = useContext(NearContext);

  const [tokenAccountId, setTokenAccountId] = useState<string>('');

  const validateAccountExists = async (accountId: string) => {
    if (!near) throw new Error('unreachable');
    if (accountId.match(/^[0-9a-f]{64}$/)) {
      return;
    }
    try {
      const { total } = (await (await near.near.account(accountId)).getAccountBalance());
      console.log(`${accountId} balance: ${total}`);
    } catch (e) {
      const message = `Account ID "${accountId}" does not exist`;
      throw new Error(message);
    }
  };

  const handleChangeTokenAccountId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTokenAccountId(value);
  };

  const handleDeployLockupContract = (e: any) => {
    e.preventDefault();

    const perform = async () => {
      try {
        if (!near?.currentUser?.signedAccountId) {
          throw new Error('expected signedAccountId to be present');
        }

        // const lockupCreator: string = near.signedAccountId;
        const lockupOperators: string[] = e.target.elements.lockup_operators.value
          .split(',').map((x: string) => x.trim()).filter((x: string) => x.length > 0);
        const draftOperators: string[] = e.target.elements.draft_operators.value
          .split(',').map((x: string) => x.trim()).filter((x: string) => x.length > 0);

        const allUniqueAccountIds = Array.from(new Set(
          [...lockupOperators, ...draftOperators, tokenAccountId],
        ));
        for (let i = 0; i < allUniqueAccountIds.length; i += 1) {
          const accountId = allUniqueAccountIds[i];
          await validateAccountExists(accountId);
        }

        const lockupSubaccountId: string = e.target.elements.lockup_subaccount_id.value;

        if (lockupOperators.length === 0) {
          throw new Error('empty lockup operators');
        }

        if (tokenAccountId.length === 0) {
          throw new Error('empty tokenAccountId');
        }

        if (lockupSubaccountId.length === 0) {
          throw new Error('empty lockupSubaccountId');
        }

        // const message = `
        //   lockup_creator: ${lockupCreator}
        //   lockup_operators: ${JSON.stringify(lockupOperators)}
        //   token_account_id: ${tokenAccountId}
        //   lockup_subaccount_id: ${lockupSubaccountId}
        // `;
        // alert(message);

        const result = await near.factoryApi.create(
          lockupSubaccountId,
          tokenAccountId,
          lockupOperators,
          draftOperators,
          `${window.location.origin + window.location.pathname}#/${lockupSubaccountId}.${FACTORY_CONTRACT_NAME}/admin/lockups`,
        );

        console.log(result);

        return result;
      } catch (error) {
        console.log(error);
        enqueueSnackbar((error as any).toString(), { variant: 'error' });
        return null;
      }
    };

    perform();
  };

  if (!(near)) {
    return null;
  }

  return (
    <div>
      <div className="header">
        <div className="container">
          <Box sx={{ display: 'flex' }}>
            <Link className="logo" to="/">LOCKUPS</Link>
            <div className="nav">
              <Link className="nav-link" to="/">Home</Link>
            </div>
          </Box>
        </div>
      </div>

      <div className="container new-lockup-contract">
        <h2>
          Create Lockup Contract for your Fungible Tokens
        </h2>

        <form className="form-submit" onSubmit={handleDeployLockupContract}>
          <div className="form-wrapper">

            <p>On this page you can deploy your own copy of lockup contract. Some more elaborative description follows here.</p>
            <div className="form-row">
              <span>Contract creator: </span>
              <div className="form-cell">
                {near.currentUser.signedAccountId && <strong>{near.currentUser.signedAccountId}</strong>}
                <button className="button" type="button" onClick={signIn}>
                  {near.currentUser.signedAccountId && 'Login as someone else' || 'Login'}
                </button>
              </div>
            </div>
            <div className="form-row">
              <span>Lockup operators: </span>
              <input type="text" id="lockup_operators" />
            </div>
            <div className="form-row">
              <span>Draft operators: </span>
              <input type="text" id="draft_operators" />
            </div>
            <div className="form-row">
              <span>Fungible token contract address: </span>
              <input
                type="text"
                id="token_account_id"
                value={tokenAccountId}
                onChange={handleChangeTokenAccountId}
              />
            </div>
            <div className="form-row">
              <span>New Lockup Contract Address: </span>
              <input type="text" id="lockup_subaccount_id" />
            </div>

            <button className="button submit" type="submit" disabled={!(near.currentUser.signedAccountId && tokenAccountId)}>
              Deploy Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
