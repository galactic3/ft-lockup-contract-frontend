import { TextareaAutosize } from '@mui/material';
import { useState } from 'react';

// import LockupsTable from '../LockupsTable';
import { parseRawSpreadsheetInput, Lockup } from '../../services/spreadsheetImport';
import { TMetadata } from '../../services/tokenApi';

function ImportDraftGroup({ token }: { token: TMetadata }) {
  const [data, setData] = useState<Lockup[]>([]);

  console.log(setData);

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      console.log(token);
      const input = event.target.value;
      const lockups = parseRawSpreadsheetInput(input);
      setData(lockups);
    } catch (e) {
      console.log(e);
    }
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
      <div>
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      {/* <LockupsTable lockups={data} token={token} /> */}
    </div>
  );
}
export default ImportDraftGroup;
