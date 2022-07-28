import { useState, useEffect, useContext } from 'react';
import { Alert } from '@mui/material';
import {
  useNavigate, useParams, useLocation, Link,
} from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

import DraftsTable from '../../components/DraftsTable';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import TokenAmountPreview from '../../components/TokenAmountPreview';
import FundButton from '../../components/FundButton';
import FundWithDaoButton from '../../components/FundWithDaoButton';
import DeleteDraftGroupButton from '../../components/DeleteDraftGroupButton';

export default function PageDraftGroup({ token, adminControls }: { token: TMetadata, adminControls: boolean }) {
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const draftGroupId: number = parseInt(useParams().draftGroupId || '', 10);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroup, setDraftGroup] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [isConverted, setIsConverted] = useState<string>('pending');

  useEffect(() => {
    const perform = async () => {
      setIsConverted('pending');
      console.log(`fetchIsConverted: ${draftGroupId} ${'pending'}`);

      if (!near) return;

      const searchParams = new URLSearchParams(window.location.search);
      const transactionHashesRaw: string | null = searchParams.get('transactionHashes');
      if (!transactionHashesRaw) {
        setIsConverted('unknown');
        console.log(`fetchIsConverted: ${draftGroupId} ${'unknown'}`);
        return;
      }
      const txHash = transactionHashesRaw.split(',')[0];
      console.log('txHash', txHash);
      const txStatus = await near.rpcProvider.txStatus(txHash, 'sender.testnet');
      console.log(txStatus);

      const methodName = txStatus.transaction.actions[0].FunctionCall.method_name;

      const successValue = (txStatus.status as any).SuccessValue;

      const args = JSON.parse(atob(txStatus.transaction.actions[0].FunctionCall.args));
      const msg = args.msg && JSON.parse(args.msg);
      const msgDraftGroupId = msg && msg.draft_group_id;

      console.log(methodName, successValue, args, msg, msgDraftGroupId);

      const result = methodName === 'ft_transfer_call' && msgDraftGroupId !== undefined && msgDraftGroupId === draftGroupId;

      if (result) {
        setIsConverted('converted');
        console.log(`fetchIsConverted: ${draftGroupId} ${'converted'}`);
      } else {
        setIsConverted('unknown');
        console.log(`fetchIsConverted: ${draftGroupId} ${'unknown'}`);
      }
    };
    perform();
  }, [near, draftGroupId]);

  useEffect(() => {
    const fetchDraftGroup = async () => {
      setDraftGroup(null);

      console.log(`fetchDraftGroup called: ${draftGroupId} ${isConverted}`);
      if (!near) return;
      console.log(isConverted);
      if (isConverted === 'pending') {
        return;
      }

      const result = await near.api.getDraftGroup(draftGroupId);
      setDraftGroup(result || 'not_found');
    };

    fetchDraftGroup(); // .catch(console.error);
  }, [near, draftGroupId, isConverted]);

  useEffect(() => {
    const fetchDrafts = async () => {
      setDrafts([]);
      console.log('fetchDrafts called');
      if (!near) {
        return;
      }
      if (!draftGroup || draftGroup === 'not_found') {
        return;
      }
      const result = await near.api.getDrafts(draftGroup.draft_indices);
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

  if (draftGroup === 'not_found') {
    const currentContractName = location.pathname.split('/')[1];
    return (
      <div className="container">
        <h1>{isConverted === 'converted' ? `Success! Draft group ${draftGroupId} have been converted!` : `Draft group ${draftGroupId} have been converted or deleted.`}</h1>
        <div>
          <br />
          Check
          {' '}
          <Link to={`/${currentContractName}${adminControls ? '/admin' : ''}/lockups`}>lockups</Link>
          {' '}
          to find converted lockups or
          {' '}
          <Link to={`/${currentContractName}${adminControls ? '/admin' : ''}/draft_groups`}>draft groups</Link>
          {' '}
          to see all existing draft groups.
        </div>
      </div>
    );
  }

  if (!near) return null;
  const { isAdmin } = near.currentUser;

  return (
    <div className="container">
      <div className="draft-group-preview-wrapper draft-group-preview-inner">
        <div className="draft-group-preview-info" style={{ display: 'flex' }}>
          <h5>
            {`Draft group ${draftGroupId}`}
            {' '}
            {draftGroup.discarded && (<span className="discarded-marker">DISCARDED</span>)}
          </h5>
          <TokenAmountPreview token={token} amount={draftGroup.total_amount} />
        </div>
        {!draftGroup.funded && adminControls && (
          <div className="draft-group-fund-button-wrapper">
            {!draftGroup.discarded && isAdmin && <FundButton draftGroupIndex={draftGroupId} amount={draftGroup.total_amount} /> }
            {!draftGroup.discarded && <FundWithDaoButton draftGroupIndex={draftGroupId} amount={draftGroup.total_amount} token={token} />}
            <DeleteDraftGroupButton
              draftGroupId={draftGroup.id}
              draftIds={draftGroup.draft_indices}
              disabled={draftGroup.funded}
            />
          </div>
        )}
        {draftGroup.funded && draftGroup.draft_indices.length > 0 && adminControls && (
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
