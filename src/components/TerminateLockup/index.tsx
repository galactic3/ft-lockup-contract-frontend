import { useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { INearProps, NearContext } from '../../services/near';

function TerminateLockup(
  props: {
    adminControls: boolean,
    lockupIndex: number | undefined,
    config: { terminator_id: String, vesting_schedule: [] | null } | null,
  },
) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { adminControls, lockupIndex, config } = props;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  const { signedAccountId } = near;

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminateLockup = async () => {
    const ts = date ? date.getTime() / 1000 : null;
    await near.api.terminate(lockupIndex, ts);
    window.location.reload();
  };

  let message;
  if (!config) {
    message = 'No termination config';
  } else if (adminControls && config.terminator_id === signedAccountId) {
    message = 'Terminate';
  } else {
    message = `Terminator: ${config.terminator_id}`;
  }

  const canTerminate = adminControls && config && config.terminator_id === signedAccountId;

  return (
    <div>
      <button className="button red fullWidth" disabled={!canTerminate} type="button" onClick={handleOpen}>{message}</button>
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
