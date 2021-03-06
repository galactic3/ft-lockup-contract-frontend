import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function ConfirmDialog(props: { message: string, isOpen: boolean, closeFn: any, callback: any }) {
  const {
    message,
    isOpen,
    closeFn,
    callback,
  } = props;

  const handleConfirm = () => {
    closeFn();
    callback();
  };

  return (
    <Dialog open={isOpen} sx={{ padding: 2 }} maxWidth="md" onClose={closeFn}>
      <DialogTitle>
        Confirmation
        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={closeFn}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ minWidth: '320px' }}>
        <div>{message}</div>
      </DialogContent>
      <DialogActions sx={{ padding: '14px 24px 24px' }}>
        <button className="button red" type="button" onClick={closeFn}>Cancel</button>
        <button className="button" type="button" onClick={handleConfirm}>Confirm</button>
      </DialogActions>
    </Dialog>
  );
}
