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
          <TableCell align="left"><span className="nowrap">ID</span></TableCell>
          <TableCell align="left"><span className="nowrap">Account ID</span></TableCell>
          <TableCell align="right"><span className="nowrap">Start date (UTC)</span></TableCell>
          <TableCell align="right"><span className="nowrap">End date (UTC)</span></TableCell>
          <TableCell align="right"><span className="nowrap">Total amount</span></TableCell>
          {progressShow && <TableCell align="center">Progress</TableCell>}
        </TableRow>
        )}
      </TableHead>
      <TableBody>
        {lockups.map((lockup, i) => (
          <DraftsTableRow key={lockup.id} pageIndex={i + 1} row={lockup} token={token} adminControls={adminControls} progressShow={progressShow} />
        ))}
      </TableBody>
    </Table>
  );
}
