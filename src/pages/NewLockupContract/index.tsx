import {
  ChangeEvent, useCallback, useContext,
} from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';

import useTitle from '../../services/useTitle';
import { FACTORY_CONTRACT_NAME } from '../../config';
import { INearProps, NearContext } from '../../services/near';
import AddRemoveInput, { TInputField } from '../../components/AddRemoveInput';
import useLocalStorage from '../../hooks/useLocalStorage';

export default function NewLockupContract() {
  useTitle('Create Lockup Contract | FT Lockup', { restoreOnUnmount: true });

  const { enqueueSnackbar } = useSnackbar();
  const { near, signIn, signOut }: { near: INearProps | null, signIn: () => void, signOut: () => void } = useContext(NearContext);

  const reSignIn = () => {
    signOut();
    signIn();
  };

  const [tokenAccountId, setTokenAccountId] = useLocalStorage('new_lockup_contract:tokenAccountId', '');
  const [name, setName] = useLocalStorage('new_lockup_contract:name', '');

  const [lockupOperators, setLockupOperators] = useLocalStorage('new_lockup_contract:lockupOperators', []);
  const [draftOperators, setDraftOperators] = useLocalStorage('new_lockup_contract:draftOperators', []);

  const PENDING = 'pending';
  const FOUND = 'found';
  const NOT_FOUND = 'not_found';

  const nameWithFactoryContractName = `${name}.${FACTORY_CONTRACT_NAME}`;

  const [accountStatuses, setAccountStatuses] = useLocalStorage('new_lockup_contract:accountStatuses', { '': NOT_FOUND }); // pending success error

  const enqueueAccountIdCheck = useCallback(async (accountId: string) => {
    if (!near) return;
    console.log('accountStatuses', accountStatuses);

    if (accountStatuses[accountId]) {
      // lookup finished or in progress
      return;
    }

    if (accountId.match(/^[0-9a-f]{64}$/)) {
      setAccountStatuses((acc: any) => {
        console.log('.');
        return { ...acc, [accountId]: FOUND };
      });
      return;
    }

    setAccountStatuses((acc: any) => {
      console.log('... pending');
      return { ...acc, [accountId]: PENDING };
    });

    try {
      const { total } = (await (await near.near.account(accountId)).getAccountBalance());
      console.log(total);
      setAccountStatuses((acc: any) => {
        console.log('...found');
        return { ...acc, [accountId]: FOUND };
      });
    } catch (e) {
      console.log(e);
      setAccountStatuses((acc: any) => {
        console.log('...not found');
        return { ...acc, [accountId]: NOT_FOUND };
      });
    }

    console.log('accountStatuses', accountStatuses);
  }, [accountStatuses, setAccountStatuses, near]);

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

  const handleChangeTokenAccountId = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTokenAccountId(value);
    enqueueAccountIdCheck(value);
  };

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setName(value);
    enqueueAccountIdCheck(nameWithFactoryContractName);
  };

  const handleChangeLockupOperators = (inputFields: TInputField[]) => {
    const array = inputFields.filter((x) => x.accountName.length > 0).map((x) => x.accountName);
    setLockupOperators(array);
  };

  const handleChangeDraftOperators = (inputFields: TInputField[]) => {
    const array = inputFields.filter((x) => x.accountName.length > 0).map((x) => x.accountName);
    setDraftOperators(array);
  };

  const handleDeployLockupContract = (e: any) => {
    e.preventDefault();

    const perform = async () => {
      try {
        if (!near?.currentUser?.signedAccountId) {
          throw new Error('expected signedAccountId to be present');
        }

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

  const lockupOperatorsMissing = lockupOperators.filter((x: string) => accountStatuses[x] === NOT_FOUND);
  const draftOperatorsMissing = draftOperators.filter((x: string) => accountStatuses[x] === NOT_FOUND);

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
              <div className="form-row_title">Contract creator: </div>
              <div className="form-row_group">
                {near.currentUser.signedAccountId ? (
                  <>
                    <strong>{near.currentUser.signedAccountId}</strong>
                    <button className="button" type="button" onClick={reSignIn}>
                      Login as someone else
                    </button>
                  </>
                ) : (
                  <button className="button" type="button" onClick={signIn}>
                    Login
                  </button>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-row_title">Lockup operators: </div>
              <div className="form-row_group">
                <AddRemoveInput
                  data={lockupOperators}
                  onChange={handleChangeLockupOperators}
                  accountIdCheck={enqueueAccountIdCheck}
                  accountStatuses={accountStatuses}
                />
                <div className="form-row_error">
                  {lockupOperators.length === 0 && <span className="red">Required</span>}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-row_title">Draft operators: </div>
              <div className="form-row_group">
                <AddRemoveInput
                  data={draftOperators}
                  onChange={handleChangeDraftOperators}
                  accountIdCheck={enqueueAccountIdCheck}
                  accountStatuses={accountStatuses}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-row_title">Fungible token contract address: </div>
              <div className="form-row_group">
                <input
                  type="text"
                  id="token_account_id"
                  value={tokenAccountId}
                  onChange={handleChangeTokenAccountId}
                />
                <div className="form-row_error">
                  {tokenAccountId && accountStatuses[tokenAccountId] === NOT_FOUND && <span className="red">Account does not exist</span>}
                  {!tokenAccountId && <span className="red">Required</span>}
                  {accountStatuses[tokenAccountId] === PENDING && <span className="gray">Checking...</span>}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-row_title">New Lockup Contract Address: </div>
              <div className="form-row_group">
                <input type="text" id="lockup_subaccount_id" value={name} onChange={handleChangeName} />
                <div className="form-row_error">
                  {name && accountStatuses[nameWithFactoryContractName] === FOUND && <span className="red">Account already exists</span>}
                  {name && accountStatuses[nameWithFactoryContractName] === PENDING && <span className="gray">Checking...</span>}
                  {name && accountStatuses[nameWithFactoryContractName] === NOT_FOUND && name && <span className="green">Account is available</span>}
                  {!name && <span className="red">Required</span>}
                </div>
              </div>
            </div>

            <button
              className="button submit"
              type="submit"
              disabled={!(
                near.currentUser.signedAccountId
                && accountStatuses[tokenAccountId] === FOUND
                && lockupOperators.length > 0
                && lockupOperatorsMissing.length === 0
                && draftOperatorsMissing.length === 0
                && name
                && accountStatuses[nameWithFactoryContractName] === NOT_FOUND
              )}
            >
              Deploy Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
