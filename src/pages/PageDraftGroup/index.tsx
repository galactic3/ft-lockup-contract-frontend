import { useState, useEffect, useContext } from 'react';
import { Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DraftsTable from '../../components/DraftsTable';
import { TMetadata } from '../../services/tokenApi';
import { convertAmount } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import TokenAmountPreview from '../../components/TokenAmountPreview';

export default function PageDraftGroup({ token }: { token: TMetadata }) {
  const draftGroupId = parseInt(useParams().draftGroupId || '', 10);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroup, setDraftGroup] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [processLog, setProcessLog] = useState<string[]>([]);

  const log = (message: string) => {
    console.log(message);
    setProcessLog((oldLog) => oldLog.concat([message]));
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
      log('convert started');
      const draftIds = draftGroup.draft_indices;
      const chunkSize = 100;
      for (let i = 0; i < draftIds.length; i += chunkSize) {
        const chunk = draftIds.slice(i, i + chunkSize);
        log(`converting drafts from (${i}, ${i + chunk.length})`);
        try {
          const result = await near.api.convertDrafts(chunk);
          log(`converted drafts to lockups from (${i}, ${i + chunk.length}): ${result}`);
        } catch (e) {
          log(`ERROR: ${e}`);
          throw e;
        }
      }

      log('convert finished');
      navigate('/admin/lockups');
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
            <Alert severity="warning">Not funded, fund group first!</Alert>
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

      <pre id="import-log">
        {processLog.join('\n')}
      </pre>

      {(!draftGroup.funded || draftGroup.draft_indices.length > 0) && (
        <DraftsTable lockups={drafts} token={token} />
      )}
    </div>
  );
}
