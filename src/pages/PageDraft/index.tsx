import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import DraftsTableRow from '../../components/DraftsTable/row';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';

export default function PageDraft({
  token, adminControls,
}: { token: TMetadata, adminControls: boolean }) {
  const draftId = parseInt(useParams().draftId || '', 10);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draft, setDraft] = useState<any>();

  useEffect(() => {
    const fetchDraft = async () => {
      console.log('fetchDraft called');
      if (!near) {
        return;
      }
      const result = await near.api.getDrafts([draftId]);
      const drafts = result.map((x: any) => Object.assign(x[1].lockup_create, { id: x[0] }));
      setDraft(drafts[0]);
    };

    fetchDraft(); // .catch(console.error);
  }, [near, draftId]);

  console.log(draft);

  const progressShow = false;

  return (
    <div className="container">
      {draft && (
      <Table className="main-table" aria-label="collapsible table">
        <TableHead className="table-head">
          <TableRow>
            <TableCell />
            <TableCell align="left">ID</TableCell>
            <TableCell align="left">Account ID</TableCell>
            <TableCell align="right">Start&nbsp;date</TableCell>
            <TableCell align="right">End&nbsp;date</TableCell>
            <TableCell align="right">Total&nbsp;amount</TableCell>
            {progressShow && <TableCell align="center">Progress</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          <DraftsTableRow row={draft} token={token} adminControls={adminControls} progressShow={progressShow} />
        </TableBody>
      </Table>
      )}
    </div>
  );
}
