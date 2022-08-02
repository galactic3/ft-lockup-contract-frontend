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
          <TableCell align="left"><span className="nowrap">ID</span></TableCell>
          <TableCell align="left"><span className="nowrap">Account ID</span></TableCell>
          <TableCell align="right"><span className="nowrap">Start date (UTC)</span></TableCell>
          <TableCell align="right"><span className="nowrap">End date (UTC)</span></TableCell>
          <TableCell align="center"><span className="nowrap">Terminatable</span></TableCell>
          <TableCell align="right"><span className="nowrap">Total amount</span></TableCell>
          <TableCell align="center"><span className="nowrap">Progress</span></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lockups.map((lockup) => (
          <Row key={lockup.id} row={lockup} token={token} adminControls={adminControls} opened={false} />
        ))}
      </TableBody>
    </Table>
  );
}
