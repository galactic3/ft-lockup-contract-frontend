import { useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { INearProps, NearContext } from '../../services/near';
import { addYear } from '../../utils';

export default function CreateLockup() {
  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreateLockup = async (e: any) => {
    e.preventDefault();

    const { account, amount } = e.target.elements;

    console.log(account.value, amount.value);

    const lockupContractId = near?.api.getContract().contractId || '';
    const claimedBalance = '0';
    const userAccountId = account.value || 'alice.demo000.ft-lockup.testnet';
    const lockupTotalAmount = amount.value || '9000000';

    const ts = (startDate?.getTime() || 0) / 1000;

    const schedule = [
      { timestamp: ts, balance: '0' },
      { timestamp: addYear(startDate, 1) - 1, balance: '0' },
      { timestamp: addYear(startDate, 1), balance: (lockupTotalAmount / 4).toString() },
      { timestamp: addYear(startDate, 4), balance: lockupTotalAmount },
    ];

    const meta = {
      receiver_id: lockupContractId,
      amount: lockupTotalAmount,
      msg: {
        account_id: userAccountId,
        schedule,
        claimed_balance: claimedBalance,
      },
    };

    near?.tokenApi.ftTransferCall(meta);
  };

  return (
    <div>
      <button className="button" type="button" onClick={handleOpen}>Create Lockup</button>
      <Dialog open={open} maxWidth="xs" onClose={handleClose}>
        <form className="form_offer" onSubmit={handleCreateLockup}>
          <DialogTitle>Create Lockup</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              id="account"
              label="Account Id"
              type="text"
              sx={{ width: '75%' }}
              variant="standard"
            />
            <TextField
              margin="normal"
              id="amount"
              label="Amount"
              type="text"
              variant="standard"
              sx={{ width: '50%' }}
            />
            <br />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                }}
                renderInput={
                  (params) => (
                    <TextField
                      margin="normal"
                      sx={{ width: '50%' }}
                      variant="standard"
                      {...params}
                    />
                  )
                }
              />
            </LocalizationProvider>
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
