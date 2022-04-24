import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function TerminateLockup(props: { lockupIndex: number | undefined, config: { terminator_id: String, vesting_schedule: [] | null } | null }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { lockupIndex, config } = props;

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  const { signedAccountId } = near;

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  console.log(config);

  const handleTerminateLockup = () => {
    near.api.terminate(lockupIndex);
  };

  return (
    <button className="button red fullWidth" disabled={!config || config.terminator_id !== signedAccountId} type="button" onClick={handleTerminateLockup}>Terminate</button>
  );
}

export default TerminateLockup;
