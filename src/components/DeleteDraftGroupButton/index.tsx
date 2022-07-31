import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { LoadingButton } from '@mui/lab';
import { INearProps, NearContext } from '../../services/near';
import { discardDraftGroupSnack, deleteDraftGroupSnack } from '../Snackbars';

import success from '../Snackbars/SuccessPartials';
import failure from '../Snackbars/FailurePartials';
import { enqueueCustomSnackbar } from '../Snackbars/Snackbar';

function DeleteDraftGroupButton(props: { draftGroupId: number, draftIds: [number], disabled: boolean }) {
  const { draftGroupId, draftIds, disabled } = props;
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const [inProgress, setInProgress] = useState<boolean>(false);

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

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  const handleDelete = () => {
    const perform = async () => {
      if (!near) {
        throw new Error('near is null');
      }

      setInProgress(true);

      type TNotificationMessage = {
        positive?: string,
        negative?: string
      };

      const discardNotificationMessage: TNotificationMessage = {};

      // discard draft group
      try {
        await near.api.discardDraftGroup(draftGroupId);
        discardNotificationMessage.positive = `Discarded draft group ${draftGroupId}`;
      } catch (e) {
        if (e instanceof Error) {
          console.log(`ERROR: ${e}`);
          const { message } = e;
          if (!message.includes('cannot discard, draft group already discarded')) {
            discardNotificationMessage.negative = `Failed to discard draft group ${draftGroupId}: ${message}`;
            setInProgress(false);
            return;
          }
        } else {
          throw new Error('unreachable');
        }
      } finally {
        discardDraftGroupSnack(enqueueSnackbar, discardNotificationMessage);
      }

      const deleteNotificationMessage: TNotificationMessage = {};

      // delete all drafts
      try {
        const chunkSize = 100;
        for (let i = 0; i < draftIds.length; i += chunkSize) {
          const chunk = draftIds.slice(i, i + chunkSize);

          await withNotification(
            'Delete drafts',
            async () => {
              const result = await near.api.deleteDrafts(chunk);
              return result;
            },
          );
        }
        deleteNotificationMessage.positive = `Deleted draft group ${draftGroupId}`;
        const currentContractName = location.pathname.split('/')[1];
        navigate(`/${currentContractName}/admin/draft_groups`);
        window.location.reload();
      } catch (e) {
        if (e instanceof Error) {
          console.log(`ERROR: ${e}`);
          const { message } = e;
          deleteNotificationMessage.negative = `Failed to discard draft group ${draftGroupId}: ${message}`;
          setInProgress(false);
        } else {
          throw new Error('unreachable');
        }
      } finally {
        deleteDraftGroupSnack(enqueueSnackbar, deleteNotificationMessage);
      }
    };

    perform();
  };

  return (
    <LoadingButton
      className="button compact red"
      type="button"
      variant="contained"
      onClick={handleDelete}
      loading={inProgress}
      disabled={disabled || inProgress}
    >
      Delete
    </LoadingButton>
  );
}

export default DeleteDraftGroupButton;
