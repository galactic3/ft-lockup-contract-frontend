import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function TerminateLockup(
  props: {
    adminControls: boolean,
    lockupIndex: number | undefined,
    config: { terminator_id: String, vesting_schedule: [] | null } | null,
  },
) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { adminControls, lockupIndex, config } = props;

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

  let message;
  if (!config) {
    message = 'No termination config';
  } else if (adminControls && config.terminator_id === signedAccountId) {
    message = 'Terminate';
  } else {
    message = `Terminator: ${config.terminator_id}`;
  }

  const canTerminate = adminControls && config && config.terminator_id === signedAccountId;

  return (
    <button className="button red fullWidth" disabled={!canTerminate} type="button" onClick={handleTerminateLockup}>
      {message}
    </button>
  );
}

export default TerminateLockup;
