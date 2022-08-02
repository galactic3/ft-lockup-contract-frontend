import { useParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import useTitle from '../../services/useTitle';
import Row from '../../components/table/row';
import ClaimAllLockups from '../../components/Claim';
import { TMetadata } from '../../services/tokenApi';
import Chart from '../../components/Chart';
import { chartData } from '../../services/chartHelpers';
import { toCompactString } from '../../utils';

export default function UserLockups({ lockups: allLockups, token, adminControls }: { lockups: any[], token: TMetadata, adminControls: boolean }) {
  const { userId, id } = useParams();
  useTitle(`Lockup${id ? ` #${id}` : 's'} for ${userId} | FT Lockup`, { restoreOnUnmount: true });

  const lockups = allLockups.filter((x) => {
    if (id) {
      return x.id.toString() === id;
    }

    return x.account_id === userId || x.id.toString() === userId;
  });

  console.log('user lockups', userId, lockups);

  return (
    <div className="main">
      <div className="container">

        <h1>
          {lockups.length > 1 && 'All'}
          {' '}
          Lockup
          {id ? ` ${id}` : 's'}
          {' '}
          for
          {' '}
          {userId && toCompactString(userId, 12, 12)}
        </h1>

        {!adminControls && <ClaimAllLockups accountId={userId} token={token} lockups={lockups} />}

        {lockups.length > 1 && <Chart data={chartData(lockups, token.decimals)} />}

        <TableContainer sx={{ boxShadow: 'unset' }}>
          <Table className="main-table" aria-label="collapsible table">
            <TableHead className="table-head">
              <TableRow>
                <TableCell />
                <TableCell align="left">ID</TableCell>
                <TableCell align="left">Account ID</TableCell>
                <TableCell align="right">Start date (UTC)</TableCell>
                <TableCell align="right">End date (UTC)</TableCell>
                <TableCell align="right">Terminatable</TableCell>
                <TableCell align="right">Total amount</TableCell>
                <TableCell align="center">Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lockups.map((lockup) => (
                <Row key={lockup.id} row={lockup} token={token} adminControls={adminControls} opened={lockups.length === 1} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </div>
    </div>
  );
}
