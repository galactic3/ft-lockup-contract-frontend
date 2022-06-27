import { useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSnackbar } from 'notistack';
import Big from 'big.js';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';

// import DaoSelector from '../WithDao/DaoSelector';

function TerminateWithDao(
  props: {
    adminControls: boolean,
    lockupIndex: number | undefined,
    config: { beneficiary_id: String, vesting_schedule: [] | null } | null,
    token: TMetadata,
  },
) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const {
    adminControls,
    lockupIndex,
    config,
    token,
  } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const buttonText = config?.beneficiary_id ? 'Terminate with DAO' : 'No termination config';

  const handleTerminateWithDao = async () => {
    if (!enqueueSnackbar) return;

    const ts = date ? date.getTime() / 1000 : null;
    const result = await near.api.terminate(lockupIndex, ts);
    const amount = new Big(result as any).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
    console.log(amount);
    const message = `Terminated lockup #${lockupIndex}, refunded ${amount} ${token.symbol}`;
    enqueueSnackbar(message, { variant: 'success' });
    setTimeout(() => window.location.reload(), 1000);
  };

  const canTerminate = adminControls && config;

  return (
    <div>
      <button
        className="button red fullWidth"
        disabled={!canTerminate}
        type="button"
        onClick={handleOpen}
      >
        {buttonText}
      </button>
      <Dialog open={open} sx={{ padding: 2 }} maxWidth="xs" onClose={handleClose}>
        <form className="form-submit">
          <DialogTitle>
            Terminate with DAO
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Custom termination date"
                minDate={new Date()}
                value={date}
                onChange={(newValue) => {
                  setDate(newValue);
                }}
                renderInput={
                  (params) => (
                    <TextField
                      sx={{ margin: '20px 0 40px' }}
                      margin="normal"
                      fullWidth
                      variant="standard"
                      {...params}
                    />
                  )
                }
              />

            </LocalizationProvider>
            <button className="button red fullWidth" type="button" onClick={handleTerminateWithDao}>
              Terminate
            </button>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}

export default TerminateWithDao;
