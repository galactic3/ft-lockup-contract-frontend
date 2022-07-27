import { useContext, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import BN from 'bn.js';
import Big from 'big.js';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { INearProps, NearContext } from '../../services/near';
import { addYear, startOfDay, addDays } from '../../utils';
import { TMetadata } from '../../services/tokenApi';
import { TSchedule } from '../../services/api';
import UTCDateTimePicker from '../UTCDateTimePicker';

export default function CreateLockup({ token } : { token: TMetadata }) {
  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [schedule, setSchedule] = useState<string>('4_year');
  const handleOpen = () => {
    const newValue = addDays(startOfDay(new Date()), 1);
    console.log('setStartDate', newValue?.getTime());
    setStartDate(newValue);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [accountId, setAccountId] = useState<string>('');
  const [accountStatuses, setAccountStatuses] = useState<any>({ '': 'error' }); // pending success error
  const [amount, setAmount] = useState<string>('');

  const onScheduleSelect = (value: any) => {
    setSchedule(value.target.value);
  };

  const handleChangeAmount = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const perform = async () => {
      if (!near) return;
      const { value } = event.target;

      setAmount(value);
    };

    perform();
  };

  const handleChangeAccountId = (value: any) => {
    const perform = async () => {
      if (!near) return;
      console.log('accountStatuses', accountStatuses);

      setAccountId(value);

      if (accountStatuses[value]) {
        // lookup finished or in progress
        return;
      }

      if (value.match(/^[0-9a-f]{64}$/)) {
        setAccountStatuses((acc: any) => {
          console.log('.');
          return { ...acc, [value]: 'success' };
        });
        return;
      }

      setAccountStatuses((acc: any) => {
        console.log('.');
        return { ...acc, [value]: 'pending' };
      });

      try {
        const { total } = (await (await near.near.account(value)).getAccountBalance());
        console.log(total);
        setAccountStatuses((acc: any) => {
          console.log('.');
          return { ...acc, [value]: 'success' };
        });
      } catch (e) {
        console.log(e);
        setAccountStatuses((acc: any) => {
          console.log('.');
          return { ...acc, [value]: 'error' };
        });
      }

      console.log('accountStatuses', accountStatuses);
    };

    perform();
  };

  const handleChangeAccountIdEvent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    return handleChangeAccountId(value);
  };

  const handleCreateLockup = async (e: any) => {
    if (!near) {
      throw Error('Cannot access token api');
    }
    if (!near.currentUser.signedAccountId) {
      throw new Error('signedAccountId requred to set lockup terminator');
    }
    if (!startDate) {
      throw Error('Start date not set');
    }

    e.preventDefault();

    console.log(amount);

    const lockupContractId = near?.api.getContract().contractId || '';
    const lockupTotalAmount = new Big(amount).mul(new Big(10).pow(token.decimals))
      .round(0, Big.roundDown).toString();

    const getScheduleList = (date: Date, balanceInput: string, selected: string): [TSchedule, TSchedule | null] => {
      const balance = new BN(balanceInput);

      const schedules: { [key: string]: TSchedule } = {
        '4y_cliff_1y_25': [
          { timestamp: addYear(date, 0), balance: '0' },
          { timestamp: addYear(date, 1) - 1, balance: '0' },
          { timestamp: addYear(date, 1), balance: balance.divn(4).toString() },
          { timestamp: addYear(date, 4), balance: balance.toString() },
        ],
      };

      const schedulePairs: { [key: string]: [TSchedule, TSchedule | null] } = {
        '4_year': [schedules['4y_cliff_1y_25'], null],
        '4_year_vested': [schedules['4y_cliff_1y_25'], schedules['4y_cliff_1y_25']],
      };

      return schedulePairs[selected];
    };

    const [lockupSchedule, vestingSchedule] = getScheduleList(startDate, lockupTotalAmount, schedule);

    near.tokenApi.createLockup(
      lockupContractId,
      lockupTotalAmount.toString(),
      accountId,
      lockupSchedule,
      vestingSchedule,
    );
  };

  const validAmount = !Number.isNaN(parseFloat(amount));

  return (
    <>
      <button className="button" type="button" onClick={handleOpen}>Create Lockup</button>
      <Dialog open={open} sx={{ padding: 2 }} maxWidth="md" onClose={handleClose}>
        <form className="form-submit" onSubmit={handleCreateLockup}>
          <DialogTitle>
            Create Lockup
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ maxWidth: '320px' }}>
            <TextField
              margin="normal"
              id="account"
              label="Account Id"
              type="text"
              fullWidth
              variant="standard"
              value={accountId}
              onChange={handleChangeAccountIdEvent}
            />
            <div style={{ fontSize: 10 }}>
              {accountStatuses[accountId] === 'error' && <span style={{ color: '#FF594E' }}>Account does not exist</span>}
              {accountStatuses[accountId] === 'pending' && <span style={{ color: '#808689' }}>Checking...</span>}
              {accountStatuses[accountId] === 'success' && <span style={{ color: '#00B988' }}>Account found</span>}
            </div>
            <TextField
              margin="normal"
              id="amount"
              label="Amount"
              type="number"
              variant="standard"
              InputProps={{
                endAdornment: <InputAdornment position="end">{token.symbol}</InputAdornment>,
              }}
              fullWidth
              onChange={handleChangeAmount}
            />
            <br />
            <FormControl
              fullWidth
              sx={{ marginTop: '20px' }}
            >
              <Select
                id="schedule-select"
                value={schedule}
                label="Schedule"
                onChange={onScheduleSelect}
                variant="standard"
                fullWidth
              >
                <MenuItem value="4_year">4 year lockup with 25% cliff in 1 year</MenuItem>
                <MenuItem value="4_year_vested">4 year lockup with 25% cliff in 1 year (VESTED)</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <UTCDateTimePicker
                value={startDate}
                setValue={(newValue) => {
                  console.log('setStartDate', newValue?.getTime());
                  setStartDate(newValue);
                }}
                label="Start date and time"
                minTime={null}
                disabled={false}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ padding: '14px 24px 24px' }}>
            <button disabled={!startDate || accountStatuses[accountId] === 'error' || !validAmount} className="button fullWidth noMargin" type="submit">Create</button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
