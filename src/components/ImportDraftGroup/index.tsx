import { TextareaAutosize } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Big from 'big.js';

import { LoadingButton } from '@mui/lab';
import useTitle from '../../services/useTitle';
import DraftsTable from '../DraftsTable';
import {
  parseRawSpreadsheetInputWithErrors, TLockupOrError, Lockup, lockupTotalBalance,
} from '../../services/spreadsheetImport';
import TokenAmountPreview from '../TokenAmountPreview';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';

function ImportDraftGroup({ token, adminControls }: { token: TMetadata, adminControls: boolean }) {
  useTitle('Import draft group | FT Lockup', { restoreOnUnmount: true });

  const location = useLocation();
  const { near }: { near: INearProps | null } = useContext(NearContext);

  const [data, setData] = useState<TLockupOrError[]>([]);
  const [parseErrors, setParseErrors] = useState<Error[]>([]);
  const [importProgress, setImportProgress] = useState<boolean>(false);

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      if (!near?.currentUser?.signedAccountId) {
        throw new Error('expected present signedAccountId');
      }
      console.log(token);
      const input = event.target.value;
      const lockups = parseRawSpreadsheetInputWithErrors(input, token.decimals);
      const errorsFiltered = lockups.filter((x) => x instanceof Error).map((x) => x as Error);
      setData(lockups);
      setParseErrors(errorsFiltered);
    } catch (e) {
      if (e instanceof Error) {
        setData([]);
        setParseErrors([e]);
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

  const calcTotalBalance = (lockups: TLockupOrError[]) => {
    const lockupsFiltered = lockups.filter((x: TLockupOrError) => !(x instanceof Error)).map((x) => x as Lockup);
    const balances = lockupsFiltered.map((x: Lockup) => lockupTotalBalance(x));
    let result = new Big('0');

    balances.forEach((x) => {
      result = result.add(new Big(x));
    });
    return result.toString();
  };

  return (
    <div className="main">
      <div className="container">
        <h2>
          Import Draft Group
        </h2>

        <div className="import-draft-group-wrapper">
          <div className="draft-group-preview-inner">
            <div className="draft-group-preview-info" style={{ display: 'flex' }}>
              <h5>
                <span className="new-draft-count-text">
                  {`New draft group with ${data.length} lockup${data.length > 1 ? 's' : ''}`}
                </span>
                {' '}
                {parseErrors.length > 0 && (<span className="parse-error-label">{`${parseErrors.length} parse error${parseErrors.length > 1 ? 's' : ''}`}</span>)}
              </h5>
              <TokenAmountPreview amount={calcTotalBalance(data)} token={token} />
            </div>
          </div>

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
        <DraftsTable lockups={data} token={token} adminControls={adminControls} progressShow />
        <LoadingButton
          disabled={!(data.length >= 1 && parseErrors.length === 0 && !importProgress)}
          onClick={handleClickImport}
          loading={importProgress}
          type="button"
          className="button"
        >
          Import
        </LoadingButton>
      </div>
    </div>
  );
}
export default ImportDraftGroup;
