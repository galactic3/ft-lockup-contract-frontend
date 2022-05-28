import { TextareaAutosize } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

import DraftsTable from '../DraftsTable';
import { parseRawSpreadsheetInput, Lockup } from '../../services/spreadsheetImport';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';

function ImportDraftGroup({ token }: { token: TMetadata }) {
  const location = useLocation();
  const { near }: { near: INearProps | null } = useContext(NearContext);

  const [data, setData] = useState<Lockup[]>([]);
  const [importProgress, setImportProgress] = useState<boolean>(false);

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      if (!near?.signedAccountId) {
        throw new Error('expected present signedAccountId');
      }
      console.log(token);
      const input = event.target.value;
      const lockups = parseRawSpreadsheetInput(input, token.decimals, near.signedAccountId);
      setData(lockups);
    } catch (e) {
      if (e instanceof Error) {
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
      enqueueSnackbar(`${name} failed with error: '${e}'`);
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
      enqueueSnackbar(msg);

      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const drafts = chunk.map((lockup) => ({
          draft_group_id: draftGroupId,
          lockup,
        }));
        await withNotification(
          'Create drafts',
          async () => {
            const result = await near.api.createDrafts(drafts);
            return result;
          },
        );
      }

      enqueueSnackbar(`Created ${data.length} draft(s).`);

      const currentContractName = location.pathname.split('/')[1];
      const path = `/${currentContractName}/admin/draft_groups/${draftGroupId}`;

      navigate(path);
    } catch (e) {
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
        <LoadingButton
          disabled={!(data.length >= 1 && !importProgress)}
          loading={importProgress}
          onClick={handleClickImport}
          color="success"
          type="button"
          variant="contained"
        >
          Import
        </LoadingButton>
      </div>
    </div>
  );
}
export default ImportDraftGroup;
