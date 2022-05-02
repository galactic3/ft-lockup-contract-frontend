import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function Fund(props: { draftGroupIndex: number | undefined, amount: string | undefined }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { draftGroupIndex, amount } = props;

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (draftGroupIndex === undefined) {
    throw Error('Cannot fund draft group without index');
  }

  if (amount === undefined) {
    throw Error('Cannot fund draft group without specified amount');
  }

  const handleFund = () => {
    near.tokenApi.fundDraftGroup(
      near.api.getContract().contractId,
      draftGroupIndex,
      amount,
    );
  };

  return (
    <button className="button fullWidth" type="button" onClick={handleFund}>Fund</button>
  );
}

export default Fund;
