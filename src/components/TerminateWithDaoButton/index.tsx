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

function TerminateLockup(
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

  const handleTerminateLockup = async () => {
    if (!enqueueSnackbar) return;

    const ts = date ? date.getTime() / 1000 : null;
    const result = await near.api.terminate(lockupIndex, ts);
    const amount = new Big(result as any).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
    console.log(amount);
    const message = `Terminated lockup #${lockupIndex}, refunded ${amount} ${token.symbol}`;
    enqueueSnackbar(message, { variant: 'success' });
    setTimeout(() => window.location.reload(), 1000);
  };

  let message;
  let payerMessage;
  if (!config) {
    message = 'No termination config';
    payerMessage = 'This lockup cannot be terminated';
  } else {
    message = 'Terminate';
    payerMessage = `Unvested amount will return to ${config.beneficiary_id}`;
  }

  const canTerminate = adminControls && config;

  return (
    <div>
      <button
        className="button red fullWidth"
        disabled={!canTerminate}
        type="button"
        onClick={handleOpen}
      >
        {message}
      </button>
      <span className="fine-print">
        {payerMessage}
      </span>
      <Dialog open={open} sx={{ padding: 2 }} maxWidth="xs" onClose={handleClose}>
        <form className="form-submit">
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
            <button className="button red fullWidth" type="button" onClick={handleTerminateLockup}>
              Terminate
            </button>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}

export default TerminateLockup;
