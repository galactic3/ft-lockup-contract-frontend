import { useParams } from 'react-router-dom';
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

// eslint-disable-next-line max-len
export default function UserLockups({ lockups: allLockups, token }: { lockups: any[], token: string | null }) {
  const { userId } = useParams();

  const lockups = allLockups.filter((x) => x.account_id === userId);

  console.log('user lockups', userId, lockups);

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
              <Row key={lockup.id} row={lockup} token={token} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </div>
  );
}
