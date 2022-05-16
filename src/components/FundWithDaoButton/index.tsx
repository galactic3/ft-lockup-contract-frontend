import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function FundWithDaoButton(props: { draftGroupIndex: number | undefined, amount: string | undefined }) {
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
    alert('poopup');
  };

  return (
    <button className="button fullWidth" type="button" onClick={handleFund}>Fund with DAO</button>
  );
}

export default FundWithDaoButton;
