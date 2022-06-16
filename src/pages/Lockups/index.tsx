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

export default function Lockups({ lockups, token, adminControls }: { lockups: any[], token: TMetadata, adminControls: boolean }) {
  const uniqueUsers = Array.from(new Set(lockups.map((x) => x.account_id)));

  const {
    near,
  }: {
    near: INearProps,
  } = useContext(NearContext);

  const { signedIn, isAdmin } = near.currentUser;
  const favouriteAccountsFromLocalStorage = JSON.parse(localStorage.getItem('favouriteAccounts') || '[]');

  const [favouriteAccounts, setFavouriteAccounts] = useState<string[]>(favouriteAccountsFromLocalStorage);

  const favouriteAccountsLockups = lockups.filter((lockup) => favouriteAccounts.includes(lockup.account_id));

  const schedules = Array.from(new Set(lockups.map((x) => x.schedule)));
  const vestingSchedules = Array.from(new Set(lockups.map((x) => x.termination_config?.vesting_schedule?.Schedule))).filter((s) => s !== undefined);

  const chartData = {
    vested: lockups.length ? mergeLockupSchedules(schedules, token.decimals) : [],
    locked: lockups.length ? mergeLockupSchedules(vestingSchedules, token.decimals) : [],
  };

  // mergeSchedules(lockups[9].schedule, lockups[9].termination_config?.vesting_schedule?.Schedule, token.decimals);
  // mergeSchedules(schedules, vestingSchedules, token.decimals);

  const restOfThePage = (
    <div>
      {signedIn && adminControls && isAdmin && <CreateLockup token={token} />}

      <Chart data={chartData} />

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
          <LockupsTable lockups={favouriteAccountsLockups} token={token} adminControls={adminControls} />
        </TableContainer>
      )}
    </div>
  );

  return (
    <div className="container">
      <FavouriteAccounts favouriteAccounts={favouriteAccounts} uniqueUsers={uniqueUsers} onSave={setFavouriteAccounts} />
      { !!favouriteAccounts.length && restOfThePage }
    </div>
  );
}
