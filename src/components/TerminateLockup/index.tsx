import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function TerminateLockup(props: { lockupIndex: number | undefined }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { lockupIndex } = props;

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminateLockup = () => {
    near.api.terminate(lockupIndex);
  };

  return (
    <button className="button" type="button" onClick={handleTerminateLockup}>Terminate</button>
  );
}

export default TerminateLockup;
