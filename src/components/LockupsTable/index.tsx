import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Row from '../table/row';
import { TMetadata } from '../../services/tokenApi';

export default function LockupsTable(
  { lockups, token, adminControls }: { lockups: any[], token: TMetadata, adminControls: boolean },
) {
  return (
    <Table className="main-table" aria-label="collapsible table">
      <TableHead className="table-head">
        <TableRow>
          <TableCell />
          <TableCell align="left">ID</TableCell>
          <TableCell align="left">Account ID</TableCell>
          <TableCell align="right">Start&nbsp;date</TableCell>
          <TableCell align="right">End&nbsp;date</TableCell>
          <TableCell align="right">Total&nbsp;amount</TableCell>
          <TableCell align="center">Progress</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lockups.map((lockup) => (
          <Row key={lockup.id} row={lockup} token={token} adminControls={adminControls} />
        ))}
      </TableBody>
    </Table>
  );
}
