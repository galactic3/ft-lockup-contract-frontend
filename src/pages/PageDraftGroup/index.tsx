import { useState, useEffect, useContext } from 'react';
import { Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DraftsTable from '../../components/DraftsTable';
import { TMetadata } from '../../services/tokenApi';
import { convertAmount } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import TokenAmountPreview from '../../components/TokenAmountPreview';
import FundButton from '../../components/FundButton';
import ProcessLog from '../../components/ProcessLog';

export default function PageDraftGroup({ token }: { token: TMetadata }) {
  const draftGroupId = parseInt(useParams().draftGroupId || '', 10);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroup, setDraftGroup] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);

  const log = (message: string) => {
    console.log(message);
    setProcessLog((oldLog) => oldLog.concat([message]));
  };
  const clearLog = () => {
    setProcessLog([]);
  };

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
      setDrafts(result.map((x: any) => Object.assign(x[1].lockup, { id: x[0] })));
    };

    fetchDrafts(); // .catch(console.error);
  }, [near, draftGroup]);

  const navigate = useNavigate();

  const handleConvert = () => {
    const convertDrafts = async () => {
      if (!near) {
        throw new Error('near is null');
      }
      try {
        setInProgress(true);
        clearLog();
        const draftIds = draftGroup.draft_indices;
        const chunkSize = 100;
        for (let i = 0; i < draftIds.length; i += chunkSize) {
          const chunk = draftIds.slice(i, i + chunkSize);
          log(`converting drafts (${i}/${draftIds.length})...`);
          await near.api.convertDrafts(chunk);
        }
        log('conversion finished');
        navigate('/admin/lockups');
      } catch (e) {
        log(`ERROR: ${e}`);
      } finally {
        setInProgress(false);
      }
    };

    convertDrafts();
  };

  if (!draftGroup) {
    return null;
  }

  return (
    <div className="container">
      <div className="draft-group-preview-wrapper">
        <h5>
          {`Draft group ${draftGroupId}`}
        </h5>
        <TokenAmountPreview token={token} amount={convertAmount(draftGroup.total_amount, token.decimals)} />

        {!draftGroup.funded && (
          <div style={{ marginTop: 20 }}>
            <FundButton draftGroupIndex={draftGroupId} amount={draftGroup.total_amount} />
          </div>
        )}
        {draftGroup.funded && draftGroup.draft_indices.length > 0 && (
          <button className="button fullWidth" type="button" onClick={handleConvert}>Convert</button>
        )}
        {draftGroup.funded && draftGroup.draft_indices.length === 0 && (
          <div style={{ marginTop: 20 }}>
            <Alert severity="success">Draft Group converted</Alert>
          </div>
        )}
      </div>

      {(processLog.length > 0) && (
        <ProcessLog lines={processLog} inProgress={inProgress} />
      )}

      {(!draftGroup.funded || draftGroup.draft_indices.length > 0) && (
        <DraftsTable lockups={drafts} token={token} />
      )}
    </div>
  );
}
