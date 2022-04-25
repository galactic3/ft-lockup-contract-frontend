import { TextareaAutosize } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DraftsTable from '../DraftsTable';
import { parseRawSpreadsheetInput, Lockup } from '../../services/spreadsheetImport';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';

function ImportDraftGroup({ token }: { token: TMetadata }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  const [data, setData] = useState<Lockup[]>([]);
  const [importLog, setImportLog] = useState<string[]>([]);

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
    clearLog();
    log('import started');
    const draftGroupId = await near.api.createDraftGroup();
    const msg = `created draft group id: ${draftGroupId}`;
    log(msg);

    const chunkSize = 100;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      log(`adding drafts from (${i}, ${i + chunk.length})`);
      const drafts = chunk.map((lockup) => ({
        draft_group_id: draftGroupId,
        lockup,
      }));
      try {
        const draftIds = await near.api.createDrafts(drafts);
        log(`created drafts for from (${i}, ${i + chunk.length}): ${draftIds}`);
      } catch (e) {
        log(`ERROR: ${e}`);
        throw e;
      }
    }

    log('import finished');

    navigate(`/admin/draft_groups/${draftGroupId}`);
  };

  return (
    <div className="container">
      <h3>
        Import Draft Group
      </h3>
      <div>
        <TextareaAutosize
          style={{ width: '100%' }}
          id="spreadsheet-input"
          placeholder="Excel input"
          maxRows={5}
          onChange={handleChangeInput}
        />
      </div>
      <DraftsTable lockups={data} token={token} />
      <br />
      <div>
        <button className="button fullWidth noMargin" onClick={handleClickImport} type="button">
          Import
        </button>
      </div>
      <br />
      <pre id="import-log">
        {importLog.join('\n')}
      </pre>
    </div>
  );
}
export default ImportDraftGroup;
