import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useSnackbar } from 'notistack';

import { INearProps, NearContext } from '../../services/near';

import success from '../Snackbars/SuccessPartials';
import failure from '../Snackbars/FailurePartials';
import { enqueueCustomSnackbar } from '../Snackbars/Snackbar';

export default function SuggestConvertDialog(params: { open: boolean, setOpen: any, draftGroup: any | null }) {
  const { open, setOpen, draftGroup } = params;
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  console.log(draftGroup);
  console.log(inProgress, setInProgress);

  const withNotification = async (name: string, func: () => any): Promise<any> => {
    try {
      const result = await func();
      return result;
    } catch (e) {
      enqueueCustomSnackbar(
        enqueueSnackbar,
        success.body(`${name} failed with error: '${e}'`),
        failure.header('Error'),
      );
      throw e;
    }
  };

  const performConvert = async () => {
    if (!(near?.api)) {
      return;
    }
    try {
      setInProgress(true);
      const draftIds = draftGroup.draft_indices;
      const chunkSize = 100;
      for (let i = 0; i < draftIds.length; i += chunkSize) {
        const chunk = draftIds.slice(i, i + chunkSize);

        await withNotification(
          'Convert drafts',
          async () => {
            const result = await near.api.convertDrafts(chunk);
            return result;
          },
        );
      }
      enqueueCustomSnackbar(
        enqueueSnackbar,
        success.body(`Converted drafts for draft group ${draftGroup.id}`),
        success.header('Success'),
      );
      const currentContractName = location.pathname.split('/')[1];
      navigate(`/${currentContractName}/admin/lockups`);
      window.location.reload();
    } catch (e) {
      console.log(`ERROR: ${e}`);
    } finally {
      setInProgress(false);
    }
  };

  console.log(performConvert);

  const convertAndClose = () => {
    const perform = async () => {
      await performConvert();
      setOpen(false);
    };

    perform();
  };

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    setOpen(false);
  };

  // const buttonPart = () => (
  //   <Button variant="outlined" onClick={handleClickOpen}>
  //     Open alert dialog
  //   </Button>
  // );

  if (!near) {
    return null;
  }

  const dialogPart = () => (
    <Dialog
      open={near.currentUser.signedIn && open && draftGroup}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Convert draft group?
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
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Draft group
          {' '}
          {draftGroup.id}
          {' '}
          has been funded, but not converted yet.
          In order to use the lockups from this group, it&apos;s necessary to convert them.
          Convert the draft group now?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">Cancel</Button>
        <LoadingButton
          className="button"
          type="button"
          onClick={convertAndClose}
          loading={inProgress}
          variant="contained"
          color="success"
        >
          Convert
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <div>
      {draftGroup && dialogPart() || null}
    </div>
  );
}
