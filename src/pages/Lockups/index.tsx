import {
  Paper,
  TableContainer,
} from '@mui/material';
import { useContext, useState } from 'react';

import { Link } from 'react-router-dom';
import Chart from '../../components/Chart';

import CreateLockup from '../../components/CreateLockup';
import LockupsTable from '../../components/LockupsTable';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import FavouriteAccounts from '../../components/FavouriteAccounts';
import { mergeLockupSchedules } from '../../services/schedule';

type TToken = TMetadata & { contractId: string };

export default function Lockups({ lockups, token, adminControls }: { lockups: any[], token: TToken, adminControls: boolean }) {
  const uniqueUsers = Array.from(new Set(lockups.map((x) => x.account_id)));

  const {
    near,
  }: {
    near: INearProps,
  } = useContext(NearContext);

  const { signedIn, isAdmin } = near.currentUser;

  const storedData = localStorage.getItem(token.contractId);
  const favouriteAccountsFromLocalStorage = storedData ? JSON.parse(storedData)?.favouriteAccounts : [];
  const [favouriteAccounts, setFavouriteAccounts] = useState<string[]>(favouriteAccountsFromLocalStorage);
  const favouriteAccountsLockups = lockups.filter((lockup) => favouriteAccounts.includes(lockup.account_id));

  const schedules = Array.from(new Set(lockups.map((x) => x.schedule)));
  const vestingSchedules = Array.from(new Set(lockups.map((x) => x.termination_config?.vesting_schedule?.Schedule))).filter((s) => s !== undefined);

  const chartData = {
    vested: lockups.length ? mergeLockupSchedules(schedules, token.decimals) : [],
    locked: lockups.length ? mergeLockupSchedules(vestingSchedules, token.decimals) : [],
  };

  const restOfThePage = (
    <div>

      <Chart data={chartData} />

      <br />

      {signedIn && adminControls && isAdmin && <CreateLockup token={token} />}

      {lockups.length === 0 ? (
        <div>
          There are no lockups yet.
          {adminControls && (
            <div>
              Create single lockup or create batch of them via
              {' '}
              <Link to={`/${near.lockupContractId}/admin/draft_groups`}>Draft Groups</Link>
              .
            </div>
          )}
        </div>
      ) : (
        <TableContainer sx={{ boxShadow: 'unset', margin: '0 0 20px' }} component={Paper}>
          <LockupsTable lockups={isAdmin ? lockups : favouriteAccountsLockups} token={token} adminControls={adminControls} />
        </TableContainer>
      )}
    </div>
  );

  const showFavouriteAccounts = !window.location.href.match('admin');

  console.log('token', token);

  return (
    <div className="container">
      { showFavouriteAccounts && (
        <FavouriteAccounts
          tokenContractId={token.contractId}
          favouriteAccounts={favouriteAccounts}
          uniqueUsers={uniqueUsers}
          onSave={setFavouriteAccounts}
        />
      ) }
      { !!favouriteAccounts.length && restOfThePage }
    </div>
  );
}
