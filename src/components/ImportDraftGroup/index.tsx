import { TextareaAutosize } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DraftsTable from '../DraftsTable';
import { parseRawSpreadsheetInput, Lockup } from '../../services/spreadsheetImport';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import ProcessLog from '../ProcessLog';

function ImportDraftGroup({ token }: { token: TMetadata }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  const [data, setData] = useState<Lockup[]>([]);
  const [importLog, setImportLog] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<boolean>(false);

  const log = (message: string) => {
    console.log(message);
    setImportLog((currentLog) => currentLog.concat([message]));
  };

  const clearLog = () => {
    setImportLog([]);
  };

  console.log(setData);

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      console.log(token);
      const input = event.target.value;
      const lockups = parseRawSpreadsheetInput(input, token.decimals);
      setData(lockups);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
      }
    }
  };

  const navigate = useNavigate();

  const handleClickImport = async () => {
    if (!near) {
      throw new Error('near is null');
    }
    setImportProgress(true);
    try {
      clearLog();
      log('creating draft group...');
      const draftGroupId = await near.api.createDraftGroup();
      const msg = `created draft group id: ${draftGroupId}`;
      log(msg);

      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        log(`adding drafts (${i}/${data.length})...`);
        const drafts = chunk.map((lockup) => ({
          draft_group_id: draftGroupId,
          lockup,
        }));
        await near.api.createDrafts(drafts);
      }

      log(`added lockups (${data.length})`);

      navigate(`/admin/draft_groups/${draftGroupId}`);
    } catch (e) {
      log(`ERROR: ${e}`);
      setImportProgress(false);
    }
  };

  return (
    <div className="container">
      <h3>
        Import Draft Group
      </h3>
      <div>
        Copy lockups from a spreadsheet editor and paste into the area below.
        See
        {' '}
        <a href={`${process.env.PUBLIC_URL}/lockup_import_example.xlsx`}>
          example and format specifications
        </a>
        .
      </div>
      <div>
        <TextareaAutosize
          style={{ width: '100%', marginTop: 20 }}
          id="spreadsheet-input"
          placeholder="Excel input"
          maxRows={5}
          onChange={handleChangeInput}
        />
      </div>
      <DraftsTable lockups={data} token={token} />
      <br />
      <div>
        <button disabled={!(data.length >= 1 && !importProgress)} className="button noMargin" onClick={handleClickImport} type="button">
          Import
        </button>
      </div>
      <br />
      {(importLog.length > 0) && (
        <ProcessLog lines={importLog} inProgress={importProgress} />
      )}
    </div>
  );
}
export default ImportDraftGroup;
