import { ReactNode, useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

function Butt({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function CreateLockup() {
  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  const handleCreateLockup = async () => {
    console.log('walletConnection', near?.walletConnection);
  };

  return (
    <Butt>
      <button type="button" onClick={handleCreateLockup}>Create Lockup</button>
    </Butt>
  );
}

export default CreateLockup;
