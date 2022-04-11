// import * as BN from 'bn.js';

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
    console.log('token contract = ', near?.api.getTokenContract());

    // debugger;
    //
    // const _FT_SCHEDULE_AMOUNT_1 = '3000000';
    // const _FT_SCHEDULE_AMOUNT_2 = '6000000';
    // const _TOTAL_FT_LOCKUP_AMOUNT = '9000000';
    // const _LOCKUP_USER = 'alice.demo000.ft-lockup.testnet';
    // const _LOCKUP_MESSAGE = {
    //   "account_id": _LOCKUP_USER,
    //   "schedule": [
    //   { "timestamp": 1400000000, "balance": "000000000" },
    //   { "timestamp": 1500000000, "balance": _FT_SCHEDULE_AMOUNT_1 },
    //   { "timestamp": 1600000000, "balance": _FT_SCHEDULE_AMOUNT_2 },
    //   { "timestamp": 1700000000, "balance": _TOTAL_FT_LOCKUP_AMOUNT }
    //   ],
    //   "claimed_balance": "0",
    // };
    //
    // const meta = {
    //   receiver_id: near?.api.getContract().contractId,
    //   amount: _TOTAL_FT_LOCKUP_AMOUNT,
    //   msg: JSON.stringify(_LOCKUP_MESSAGE)
    // };
    //
    // console.log(JSON.stringify(_LOCKUP_MESSAGE))
    //
    // near?.api.getTokenContract().ft_transfer_call(meta, 300_000_000_000_000, 1).
    //   then((res:any) => console.log(res));
  };

  return (
    <Butt>
      <button type="button" onClick={handleCreateLockup}>Create Lockup</button>
    </Butt>
  );
}

export default CreateLockup;
