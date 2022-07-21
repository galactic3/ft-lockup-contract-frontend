import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import DaoSelector from '../WithDao/DaoSelector';
import DaoProposalDescription from '../WithDao/DaoProposalDescription';
import UTCDateTimePicker from '../UTCDateTimePicker';

type TUIElement<Ctype> = {
  currentState: {
    value: Ctype,
    setValue: any,
  },
};

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
    dateTimePicker: TUIElement<Date | null>,
    daoSelector?: TUIElement<string>,
    daoProposalDescription?: TUIElement<string>,
  },
};

function TerminateModal({ currentState, handlers, dialog }: TProps) {
  return (
    <Dialog open={currentState.value} sx={{ padding: 2 }} maxWidth="xs" onClose={handlers.onClose}>
      <form className="form-submit">
        <DialogTitle>
          Terminate Lockup
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
            {dialog.dateTimePicker && (
              <UTCDateTimePicker
                value={dialog.dateTimePicker.currentState.value}
                setValue={(newValue) => {
                  dialog.dateTimePicker.currentState.setValue(newValue);
                }}
                label="Custom termination date and time"
                minTime={new Date()}
              />
            )}
            { dialog?.daoSelector && (
              <DaoSelector
                selectedAddress={dialog.daoSelector.currentState.value}
                setSelectedAddress={dialog.daoSelector.currentState.setValue}
              />
            ) }
            { dialog?.daoProposalDescription && (
              <DaoProposalDescription
                proposalDescription={dialog.daoProposalDescription.currentState.value}
                setProposalDescription={dialog.daoProposalDescription.currentState.setValue}
              />
            ) }
          </LocalizationProvider>
          <span style={{ minHeight: '40px' }} />
          <button className="button red fullWidth" style={{ marginTop: '40px' }} type="button" onClick={handlers.onSubmit}>
            Terminate
          </button>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default TerminateModal;
