import { useState, useEffect, useContext } from 'react';
import { Alert } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

import DraftsTable from '../../components/DraftsTable';
import { TMetadata } from '../../services/tokenApi';
import { convertAmount } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import TokenAmountPreview from '../../components/TokenAmountPreview';
import FundButton from '../../components/FundButton';
import FundWithDaoButton from '../../components/FundWithDaoButton';

export default function PageDraftGroup({ token, adminControls }: { token: TMetadata, adminControls: boolean }) {
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const draftGroupId = parseInt(useParams().draftGroupId || '', 10);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroup, setDraftGroup] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);

  console.log(token);
  console.log(draftGroup);
  console.log(setDraftGroup);

  useEffect(() => {
    const fetchDraftGroup = async () => {
      setDraftGroup(null);
      console.log('fetchDraftGroup called');
      if (!near) {
        return;
      }
      const result = await near.api.getDraftGroup(draftGroupId);
      console.log(result);
      setDraftGroup(result);
    };

    fetchDraftGroup(); // .catch(console.error);
  }, [near, draftGroupId]);

  useEffect(() => {
    const fetchDrafts = async () => {
      setDrafts([]);
      console.log('fetchDrafts called');
      if (!near) {
        return;
      }
      if (!draftGroup) {
        return;
      }
      const result = await near.api.getDrafts(draftGroup.draft_indices);
      console.log(result);
      setDrafts(result.map((x: any) => Object.assign(x[1].lockup_create, { id: x[0] })));
    };

    fetchDrafts(); // .catch(console.error);
  }, [near, draftGroup]);

  const navigate = useNavigate();

  const withNotification = async (name: string, func: () => any): Promise<any> => {
    try {
      const result = await func();
      return result;
    } catch (e) {
      enqueueSnackbar(`${name} failed with error: '${e}'`, { variant: 'error' });
      throw e;
    }
  };

  const handleConvert = () => {
    const convertDrafts = async () => {
      if (!near) {
        throw new Error('near is null');
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
        enqueueSnackbar(`Converted drafts for draft group ${draftGroupId}`, { variant: 'success' });
        const currentContractName = location.pathname.split('/')[1];
        navigate(`/${currentContractName}/admin/lockups`);
        window.location.reload();
      } catch (e) {
        console.log(`ERROR: ${e}`);
      } finally {
        setInProgress(false);
      }
    };

    convertDrafts();
  };

  if (!draftGroup) {
    return null;
  }

  const amount = {
    value: draftGroup.total_amount,
    label: convertAmount(draftGroup.total_amount, token.decimals) || '',
  };

  return (
    <div className="container">
      <div className="draft-group-preview-wrapper">
        <div className="draft-group-preview-info" style={{ display: 'flex' }}>
          <h5>{`Draft group ${draftGroupId}`}</h5>
          <TokenAmountPreview token={token} amount={amount.label} />
        </div>
        {!draftGroup.funded && (
          <div className="draft-group-fund-button-wrapper">
            {adminControls && <FundButton draftGroupIndex={draftGroupId} amount={amount.value} /> }
            <FundWithDaoButton draftGroupIndex={draftGroupId} amount={amount} />
          </div>
        )}
        {draftGroup.funded && draftGroup.draft_indices.length > 0 && (
          <div className="draft-group-fund-button-wrapper">
            <LoadingButton
              className="button"
              type="button"
              onClick={handleConvert}
              loading={inProgress}
              variant="contained"
              color="success"
            >
              Convert
            </LoadingButton>
          </div>
        )}
        {draftGroup.funded && draftGroup.draft_indices.length === 0 && (
          <div style={{ marginTop: 20 }}>
            <Alert severity="success">Draft Group converted</Alert>
          </div>
        )}
      </div>

      {(!draftGroup.funded || draftGroup.draft_indices.length > 0) && (
        <DraftsTable lockups={drafts} token={token} adminControls={adminControls} progressShow />
      )}
    </div>
  );
}
