import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { TMetadata } from '../../services/tokenApi';
import DraftsTableRow from './row';

export default function DraftsTable({
  lockups, token, adminControls, progressShow,
}: { lockups: any[], token: TMetadata, adminControls: boolean, progressShow: boolean }) {
  return (
    <Table className="main-table" aria-label="collapsible table">
      <TableHead className="table-head">
        {lockups.length > 0 && (
        <TableRow>
          <TableCell />
          <TableCell align="left">ID</TableCell>
          <TableCell align="left">Account ID</TableCell>
          <TableCell align="right">Start&nbsp;date</TableCell>
          <TableCell align="right">End&nbsp;date</TableCell>
          <TableCell align="right">Total&nbsp;amount</TableCell>
          {progressShow && <TableCell align="center">Progress</TableCell>}
        </TableRow>
        )}
      </TableHead>
      <TableBody>
        {lockups.map((lockup) => (
          <DraftsTableRow key={lockup.id} row={lockup} token={token} adminControls={adminControls} progressShow={progressShow} />
        ))}
      </TableBody>
    </Table>
  );
}
