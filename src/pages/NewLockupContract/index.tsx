import { useContext } from 'react';
import Header from '../../components/Header';
import { INearProps, NearContext } from '../../services/near';

export default function NewLockupContract() {
  const { near, signIn }: { near: INearProps | null, signIn: () => void } = useContext(NearContext);

  const handleDeployLockupContract = (e: any) => {
    e.preventDefault();

    const perform = async () => {
      if (!near?.signedAccountId) {
        throw new Error('expected signedAccountId to be present');
      }

      // const lockupCreator: string = near.signedAccountId;
      const lockupOperators: string[] = e.target.elements.lockup_operators.value
        .split(',').map((x: string) => x.trim()).filter((x: string) => x.length > 0);
      const tokenAccountId: string = e.target.elements.token_account_id.value;
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
        `/${lockupSubaccountId}/admin/lockups`,
      );

      console.log(result);

      return result;
    };

    perform();
  };

  if (!(near)) {
    return null;
  }

  return (
    <div>
      <Header adminControls={false} />
      <div className="container new-lockup-contract">
        <h1>
          Create Lockup Contract for your Fungible Tokens
        </h1>

        <form className="form-submit" onSubmit={handleDeployLockupContract}>
          <div className="form-wrapper">

            <div className="form-row">
              <span>Contract creator: </span>
              <strong>{near.signedAccountId}</strong>
              {' '}
              <button className="button" type="button" onClick={signIn}>
                {near.signedAccountId && 'Login as someone else' || 'Login'}
              </button>
            </div>
            <div className="form-row">
              <span>Lockup operators: </span>
              <input type="text" id="lockup_operators" />
            </div>
            <div className="form-row">
              <span>Fungible token contract address: </span>
              <input type="text" id="token_account_id" />
            </div>
            <div className="form-row">
              <span>New Lockup Contract Address: </span>
              <input type="text" id="lockup_subaccount_id" />
            </div>

            <button className="button middle" type="submit" disabled={!near.signedAccountId}>
              Deploy Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
