import {
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
import { TSchedule } from '../../services/api';

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

  const chartData = (lockupsList: any[]): any => {
    const schedules = Array.from(new Set(lockupsList.map((x) => x.schedule))) as TSchedule[];
    const vestingSchedules = Array.from(new Set(lockupsList.map((x) => x?.termination_config?.vesting_schedule?.Schedule))).filter((s) => s !== undefined) as TSchedule[];

    return {
      vested: lockupsList.length ? mergeLockupSchedules(schedules, token.decimals) : [],
      locked: lockupsList.length ? mergeLockupSchedules(vestingSchedules, token.decimals) : [],
    };
  };

  const lockupsTable = (lockupsList: any): any => {
    if (lockupsList.length > 0) {
      return (
        <>
          <Chart data={chartData(lockupsList)} />

          { signedIn && adminControls && isAdmin && <CreateLockup token={token} /> }

          <TableContainer sx={{ boxShadow: 'unset', margin: '0 0 20px' }}>
            <LockupsTable lockups={lockupsList} token={token} adminControls={adminControls} />
          </TableContainer>
        </>
      );
    }

    return (
      <div>
        There are no lockups yet.
        {adminControls && (
          <div>
            Create single lockup or create batch of them via
            {' '}
            <Link to={`/${near.lockupContractId}/admin/import_draft_group`}>Draft Groups</Link>
            .
          </div>
        )}
      </div>
    );
  };

  console.log('favouriteAccountsLockups', favouriteAccountsLockups);

  if (adminControls) {
    return (
      <div className="main">
        <div className="container">
          {lockupsTable(lockups)}
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="container">
        <FavouriteAccounts
          tokenContractId={token.contractId}
          favouriteAccounts={favouriteAccounts}
          uniqueUsers={uniqueUsers}
          onSave={setFavouriteAccounts}
        />
        {lockupsTable(favouriteAccountsLockups)}
      </div>
    </div>
  );
}
