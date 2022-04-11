import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';
import CreateLockupService from '../../services/CreateLockupService';

function CreateLockup() {
  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  const handleCreateLockup = async () => {
    const tokenContract = near?.api?.getTokenContract();

    if (!tokenContract) {
      throw new Error('token contract is not initialized!');
    }

    const lockupContractId = near?.api.getContract().contractId || '';
    const lockupTotalAmount = '9000000';
    const schedule = [
      { timestamp: 1400000000, balance: '0000000' },
      { timestamp: 1500000000, balance: '3000000' },
      { timestamp: 1600000000, balance: '6000000' },
      { timestamp: 1700000000, balance: lockupTotalAmount },
    ];
    const userAccountId = 'bob.demo000.ft-lockup.testnet';
    const claimedBalance = '0';

    const createLockup = new CreateLockupService(
      tokenContract,
      schedule,
      lockupContractId,
      userAccountId,
      lockupTotalAmount,
      claimedBalance,
    );

    createLockup.call();
  };

  return (
    <button className="button" type="button" onClick={handleCreateLockup}>Create Lockup</button>
  );
}

export default CreateLockup;
