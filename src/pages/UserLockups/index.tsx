import { useParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Big from 'big.js';

import Row from '../../components/table/row';
import ClaimAllLockups from '../../components/Claim';
import { TMetadata } from '../../services/tokenApi';

export default function UserLockups({ lockups: allLockups, token, adminControls }: { lockups: any[], token: TMetadata, adminControls: boolean }) {
  const { userId, id } = useParams();

  const lockups = allLockups.filter((x) => {
    if (id) {
      return x.id.toString() === id;
    }

    return x.account_id === userId || x.id.toString() === userId;
  });

  const totalUnclaimedBalance: string = lockups.reduce((acc, obj) => new Big(acc).add(obj.unclaimed_balance), '0');

  console.log('user lockups', userId, lockups);

  return (
    <div className="main">
      <div className="container">

        {!adminControls && <ClaimAllLockups accountId={userId} token={token} total={totalUnclaimedBalance} />}

        <TableContainer sx={{ boxShadow: 'unset' }}>
          <Table className="main-table" aria-label="collapsible table">
            <TableHead className="table-head">
              <TableRow>
                <TableCell />
                <TableCell align="left">ID</TableCell>
                <TableCell align="left">Account ID</TableCell>
                <TableCell align="right">Start&nbsp;date</TableCell>
                <TableCell align="right">End&nbsp;date</TableCell>
                <TableCell align="right">Terminatable</TableCell>
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

      </div>
    </div>
  );
}
