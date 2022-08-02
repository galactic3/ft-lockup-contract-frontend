import { useContext } from 'react';
import { Button } from '@mui/material';
import { INearProps, NearContext } from '../../services/near';

function FundButton(props: { draftGroupIndex: number, amount: string }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { draftGroupIndex, amount } = props;

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  const handleFund = () => {
    near.tokenApi.fundDraftGroup(
      near.api.getContract().contractId,
      draftGroupIndex,
      amount,
    );
  };

  return (
    <Button variant="outlined" className="button" type="button" onClick={handleFund}>Fund</Button>
  );
}

export default FundButton;
