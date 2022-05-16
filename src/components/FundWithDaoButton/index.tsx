import { useContext, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { INearProps, NearContext } from '../../services/near';

function FundWithDaoButton(props: { draftGroupIndex: number | undefined, amount: string | undefined }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { draftGroupIndex, amount } = props;

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (draftGroupIndex === undefined) {
    throw Error('Cannot fund draft group without index');
  }

  if (amount === undefined) {
    throw Error('Cannot fund draft group without specified amount');
  }

  const handleFund = () => {
    alert('poopup');
  };

  return (
    <div>
      <button className="button fullWidth" type="button" onClick={handleOpen}>Fund with DAO</button>
      <Dialog open={open} sx={{ padding: 1 }} maxWidth="xs" onClose={handleClose}>
        <form className="form-submit" onSubmit={handleFund}>
          <DialogTitle>
            Fund with DAO
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
          <DialogContent style={{ paddingTop: '1.25em' }} sx={{ maxWidth: '320px' }}>
            <TextField
              id="outlined-multiline-static"
              label="Proposal description"
              multiline
              minRows={5}
              defaultValue={`Fund draft group ${draftGroupIndex} with amount ${amount}. Draft group link: ${window.location.href}`}
            />
          </DialogContent>
          <DialogActions sx={{ padding: '14px 24px 24px' }}>
            <button className="button fullWidth noMargin" type="submit">Fund</button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

export default FundWithDaoButton;
