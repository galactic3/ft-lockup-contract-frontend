import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { LoadingButton } from '@mui/lab';
import { INearProps, NearContext } from '../../services/near';

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
      enqueueSnackbar(`${name} failed with error: '${e}'`, { variant: 'error' });
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

      // discard draft group
      try {
        await near.api.discardDraftGroup(draftGroupId);
        enqueueSnackbar(`Discarded draft group ${draftGroupId}`, { variant: 'success' });
      } catch (e) {
        if (e instanceof Error) {
          console.log(`ERROR: ${e}`);
          const { message } = e;
          if (!message.includes('cannot discard, draft group already discarded')) {
            enqueueSnackbar(`Failed to discard draft group ${draftGroupId}: ${message}`, { variant: 'error' });
            setInProgress(false);
            return;
          }
        } else {
          throw new Error('unreachable');
        }
      }

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
        enqueueSnackbar(`Deleted draft group ${draftGroupId}`, { variant: 'success' });
        const currentContractName = location.pathname.split('/')[1];
        navigate(`/${currentContractName}/admin/draft_groups`);
        window.location.reload();
      } catch (e) {
        if (e instanceof Error) {
          console.log(`ERROR: ${e}`);
          const { message } = e;
          enqueueSnackbar(`Failed to discard draft group ${draftGroupId}: ${message}`, { variant: 'error' });
          setInProgress(false);
        } else {
          throw new Error('unreachable');
        }
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
