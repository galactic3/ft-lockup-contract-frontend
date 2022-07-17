import { TextareaAutosize } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import DraftsTable from '../DraftsTable';
import { parseRawSpreadsheetInput, Lockup } from '../../services/spreadsheetImport';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';

function ImportDraftGroup({ token, adminControls }: { token: TMetadata, adminControls: boolean }) {
  const location = useLocation();
  const { near }: { near: INearProps | null } = useContext(NearContext);

  const [data, setData] = useState<Lockup[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<boolean>(false);

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      if (!near?.currentUser?.signedAccountId) {
        throw new Error('expected present signedAccountId');
      }
      console.log(token);
      const input = event.target.value;
      const lockups = parseRawSpreadsheetInput(input, token.decimals);
      setData(lockups);
      setParseError(null);
    } catch (e) {
      if (e instanceof Error) {
        setData([]);
        setParseError(e.message);
        console.log(e);
      }
    }
  };

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const withNotification = async (name: string, func: () => any): Promise<any> => {
    try {
      const result = await func();
      return result;
    } catch (e) {
      enqueueSnackbar(`${name} failed with error: '${e}'`, { variant: 'error' });
      throw e;
    }
  };

  const handleClickImport = async () => {
    try {
      if (!near) {
        throw new Error('near is null');
      }
      setImportProgress(true);
      const draftGroupId = await withNotification(
        'Create draft group',
        async () => {
          const result = await near.api.createDraftGroup();
          return result;
        },
      );
      const msg = `Created draft group id: ${draftGroupId}`;
      enqueueSnackbar(msg, { variant: 'success' });

      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const drafts = chunk.map((lockup) => ({
          draft_group_id: draftGroupId,
          lockup_create: lockup,
        }));
        await withNotification(
          'Create drafts',
          async () => {
            const result = await near.api.createDrafts(drafts);
            return result;
          },
        );
      }

      const message = `Created ${data.length} draft${data.length > 1 ? 's' : ''}.`;
      enqueueSnackbar(message, { variant: 'success' });

      const currentContractName = location.pathname.split('/')[1];
      const path = `/${currentContractName}/admin/draft_groups/${draftGroupId}`;

      navigate(path);
    } catch (e) {
      setImportProgress(false);
    }
  };

  return (
    <div className="main">
      <div className="container">
        <h2>
          Import Draft Group
        </h2>
        <div className="import-draft-group-wrapper">
          <p>
            Copy lockups from a spreadsheet editor and paste into the area below.
            See
            {' '}
            <a href={`${process.env.PUBLIC_URL}/lockup_import_example.xlsx`}>
              example and format specifications
            </a>
            .
          </p>
          <TextareaAutosize
            className="import-draft-group-textarea"
            id="spreadsheet-input"
            placeholder="Excel input"
            maxRows={5}
            onChange={handleChangeInput}
          />
        </div>
        <DraftsTable lockups={data} token={token} adminControls={adminControls} progressShow={false} />
        {parseError && (
          <div style={{ color: 'red' }}>
            Parse error:
            {' '}
            {parseError}
          </div>
        )}
        <button
          disabled={!(data.length >= 1 && !importProgress)}
          onClick={handleClickImport}
          type="button"
          className="button"
        >
          Import
        </button>
      </div>
    </div>
  );
}
export default ImportDraftGroup;
