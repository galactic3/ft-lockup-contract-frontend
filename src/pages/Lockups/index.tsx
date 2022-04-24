import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useContext } from 'react';
import Row from '../../components/table/row';
import CreateLockup from '../../components/CreateLockup';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';

export default function Lockups({ lockups, token, adminControls }: { lockups: any[], token: TMetadata, adminControls: boolean }) {
  const uniqueUsers = Array.from(new Set(lockups.map((x) => x.account_id)));

  console.log('unique users', uniqueUsers);

  const {
    near,
  }: {
    near: INearProps | null,
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn, isAdmin } = near;

  return (
    <div className="container">

      <TableContainer sx={{ boxShadow: 'unset', margin: '0 0 20px' }} component={Paper}>
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
      </TableContainer>

      {signedIn && adminControls && isAdmin && <CreateLockup token={token} />}

    </div>
  );
}
