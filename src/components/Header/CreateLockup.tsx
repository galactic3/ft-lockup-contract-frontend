// import * as BN from 'bn.js';

import { ReactNode, useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';
import { TLockup } from '../../services/api';
import CreateLockupService from '../../services/CreateLockupService';

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
    const FT_SCHEDULE_AMOUNT_1 = '3000000';
    const FT_SCHEDULE_AMOUNT_2 = '6000000';
    const TOTAL_FT_LOCKUP_AMOUNT = '9000000';
    const LOCKUP_USER = 'bob.backail_caller.testnet';
    const lockupView = {
      account_id: LOCKUP_USER,
      schedule: [
        { timestamp: 1400000000, balance: '000000000' },
        { timestamp: 1500000000, balance: FT_SCHEDULE_AMOUNT_1 },
        { timestamp: 1600000000, balance: FT_SCHEDULE_AMOUNT_2 },
        { timestamp: 1700000000, balance: TOTAL_FT_LOCKUP_AMOUNT },
      ],
      claimed_balance: '0',
    } as TLockup;

    const tokenContract = near?.api.getTokenContract();
    console.log('token contract = ', tokenContract);

    const lockupContract = near?.api.getContract();
    console.log('lockup contract = ', lockupContract);

    const createLockup = new CreateLockupService(
      lockupContract,
      tokenContract,
      lockupView,
      TOTAL_FT_LOCKUP_AMOUNT,
    );
    console.log('createLockup = ', createLockup);

    createLockup.call();
  };

  return (
    <Butt>
      <button type="button" onClick={handleCreateLockup}>Create Lockup</button>
    </Butt>
  );
}

export default CreateLockup;
