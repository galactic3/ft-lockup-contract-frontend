// import { ReactNode, useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { INearProps, NearContext } from '../../services/near';
import { TextareaAutosize } from '@mui/material';
import { useState } from 'react';
import { parseRawSpreadsheetInput } from '../../services/spreadsheetImport';
import { TMetadata } from '../../services/tokenApi';

function ImportDraftGroup({ token }: { token: TMetadata }) {
  const [data, setData] = useState('');

  console.log(setData);

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      console.log(token);
      const input = event.target.value;
      const lockups = parseRawSpreadsheetInput(input);
      setData(JSON.stringify(lockups, null, 2));
    } catch (e) {
      console.log(e);
      setData(`Error: ${e}`);
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
          {data}
        </pre>
      </div>
    </div>
  );
}
export default ImportDraftGroup;
