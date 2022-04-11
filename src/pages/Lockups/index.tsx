import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Row from '../../components/table/row';
import CreateLockup from '../../components/Header/CreateLockup';

export default function Lockups({ lockups }: { lockups: any[] }) {
  const uniqueUsers = Array.from(new Set(lockups.map((x) => x.account_id)));

  console.log('unique users', uniqueUsers);

  return (
    <div className="container">

      <TableContainer sx={{ boxShadow: 'unset' }} component={Paper}>
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
              <Row key={lockup.id} row={lockup} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateLockup />

    </div>
  );
}
