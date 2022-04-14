import { useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { INearProps, NearContext } from '../../services/near';
import CreateLockupService from '../../services/CreateLockupService';

export default function CreateLockup() {
  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreateLockup = async (e: any) => {
    e.preventDefault();

    const tokenContract = near?.api?.getTokenContract();

    if (!tokenContract) {
      throw new Error('token contract is not initialized!');
    }

    const { sender, account, amount } = e.target.elements;

    console.log(sender.value, account.value, amount.value);

    const lockupContractId = near?.api.getContract().contractId || '';
    const claimedBalance = '0';
    const userAccountId = account.value || 'alice.demo000.ft-lockup.testnet';
    const senderAccountId = sender.value || 'owner.demo000.ft-lockup.testnet';
    const lockupTotalAmount = amount.value || '9000000';
    const schedule = [
      { timestamp: 1400000000, balance: '0000000' },
      { timestamp: 1500000000, balance: '3000000' },
      { timestamp: 1600000000, balance: '6000000' },
      { timestamp: 1700000000, balance: lockupTotalAmount },
    ];

    const createLockup = new CreateLockupService(
      tokenContract,
      schedule,
      lockupContractId,
      userAccountId,
      senderAccountId,
      lockupTotalAmount,
      claimedBalance,
    );

    createLockup.call();
  };

  return (
    <div>
      <button className="button" type="button" onClick={handleOpen}>Create Lockup</button>
      <Dialog open={open} onClose={handleClose}>
        <form className="form_offer" onSubmit={handleCreateLockup}>
          <DialogTitle>Create Lockup</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="sender"
              label="Sender"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="account"
              label="Account Id"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="amount"
              label="Amount"
              type="text"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
