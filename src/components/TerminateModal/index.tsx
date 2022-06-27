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

type TProps = {
  currentState: {
    value: boolean,
    setValue: any,
  },
  handlers: {
    onClose: any,
    onSubmit: any,
  },
  dialog: {
    datePicker: {
      currentState: {
        value: Date | null,
        setValue: any,
      },
      visible: boolean,
    },
  },
};

function TerminateModal({ currentState, handlers, dialog }: TProps) {
  return (
    <Dialog open={currentState.value} sx={{ padding: 2 }} maxWidth="xs" onClose={handlers.onClose}>
      <form className="form-submit">
        <DialogTitle>
          Create Lockup
          <IconButton
            aria-label="close"
            onClick={handlers.onClose}
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
            { dialog.datePicker.visible && (
              <DatePicker
                label="Custom termination date"
                minDate={new Date()}
                value={dialog.datePicker.currentState.value}
                onChange={(newValue) => {
                  dialog.datePicker.currentState.setValue(newValue);
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
            ) }
          </LocalizationProvider>
          <button className="button red fullWidth" type="button" onClick={handlers.onSubmit}>
            Terminate
          </button>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default TerminateModal;
