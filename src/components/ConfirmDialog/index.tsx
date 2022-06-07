import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
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
      <DialogActions>
        <Button color="error" onClick={closeFn}>Cancel</Button>
        <Button color="success" variant="contained" onClick={handleConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
