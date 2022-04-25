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
    log('import started');
    const contract = near.api.getContract();
    const draftGroupId = await contract.create_draft_group();
    const msg = `created draft group id: ${draftGroupId}`;
    log(msg);

    for (let i = 0; i < data.length; i += 1) {
      const lockup = data[i];
      log(`adding draft for ${lockup.account_id}`);
      const draft = JSON.parse(JSON.stringify({
        draft_group_id: draftGroupId,
        lockup,
      }));
      try {
        const draftId = await contract.create_draft({ draft });
        log(`created draft for ${lockup.account_id}: ${draftId}`);
      } catch (e) {
        console.log(`ERROR: ${e}`);
      }
    }

    debugger;

    log('import finished');

    navigate(`/admin/draft_group/${draftGroupId}`);
  };

  return (
    <div>
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
      <div>
        <button className="button fullWidth noMargin" onClick={handleClickImport} type="button">
          Import
        </button>
      </div>
      <div id="import-log">
        <ul>
          {importLog.map((line) => <li>{line}</li>)}
        </ul>
      </div>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
export default ImportDraftGroup;
