import {
  Paper,
  TableContainer,
} from '@mui/material';
import { useContext } from 'react';

import { Link } from 'react-router-dom';

import CreateLockup from '../../components/CreateLockup';
import LockupsTable from '../../components/LockupsTable';
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
          <LockupsTable lockups={lockups} token={token} adminControls={adminControls} />
        </TableContainer>
      )}
    </div>
  );
}
