import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

import useTitle from '../../services/useTitle';

export default function About() {
  useTitle('About | FT Lockup', { restoreOnUnmount: true });

  return (
    <div className="root">
      <div className="header">
        <div className="container">
          <Box sx={{ display: 'flex' }}>
            <Link className="logo" to="/">LOCKUPS</Link>
          </Box>
        </div>
      </div>
      <div className="container">
        <h1>Fungible Token Lockup</h1>

        <h2>Purpose</h2>

        <div>
          <p>Community Lockup is dApp implementing locking and vesting of any arbitrary fungible token on NEAR in the generally known sense of these words.</p>
          <p>Lockup is a gradual release of tokens according to a specified schedule. After release tokens are in full control of the beneficiary.</p>
          <p>
            Vesting is a gradual allocation of tokens to the beneficiary according to a specified schedule,
            provided certain conditions are met (for example, beneficiary keeps working for the payer).
          </p>
          <p>
            Vested tokens are NOT immediately available to the beneficiary, however
            they WILL be available to the beneficiary according to the lockup
            schedule. Vested tokens are GUARANTEED to be received at some point in
            the future, while unvested token amount may be withdrawn by the payer if
            the lockup agreement is terminated.
          </p>
        </div>

        <h2>Users</h2>

        <div>
          <p>There are two roles in the app: payer (also called admin), most commonly the employer, and beneficiaries, most commonly the employees. There is also an implicit “anyone” role.</p>

          <ul>
            <li>
              All users (“anyone”) are able to view ALL lockup information stored
              in the blockchain for any existing lockup contract. They are also
              able to create new lockup contract and become admin for that new
              lockup contract.
            </li>
            <li>Beneficiary users have ability to claim unlocked tokens dedicated to them</li>
            <li>Admin users can create new lockups (one by one or via excel import) and terminate existing lockups that can be terminated</li>
            <li>Draft operators can create draft groups, drafts, delete draft groups, drafts.</li>
          </ul>
        </div>

        <h2>Lockups</h2>

        <div>
          <p>Each lockup has the following fields:</p>
          <ul>
            <li>Account ID: NEAR account id that will receive the tokens</li>
            <li>
              Schedule: the lockup schedule, according to which the tokens are
              released. Is represented by a monotonous piecewise linear function .
              Where x is the time axis and y is the amount of unlocked tokens at
              any specific moment.
            </li>
            <li>
              Vesting schedule: optional. According to this schedule tokens are
              vested, i. e. allocated to the beneficiary irrevocably. Operator is
              able to terminate the lockup at any effective moment in the future.
              If this happens, then the lockup schedule is capped at the total
              vested amount at the effective moment of termination.
            </li>
            <li>
              Payer id: optional. account id that paid for the specific lockup.
              Only recorded for terminatable lockups. If the lockup is terminated
              - unvested tokens will be returned back to the payer upon
              termination.
            </li>
            <li>
              Claimed balance: already claimed balance for the lockup. Used for
              tracking claim progress.
            </li>
          </ul>
        </div>

        <h2>Lockup and vesting logic</h2>

        <div>

          <img src="https://bafkreiaghj56tpqi5qzivzzue7kudpp5amyhbxqzgjakydp6anprtbxxu4.ipfs.nftstorage.link/" alt="Lockup and vesting schedule" />
          <p>Consider the following lockup with a four year duration.</p>
          <p>The vesting schedule is blue. One year cliff, then 1 / 4 is vested, then vesting is linear till the end (4 years mark).</p>
          <p>The lockup schedule is green. Two years cliff with zero amount. Then two years of linear lockup till full amount</p>
          <p>Consider the termination happening at the 2.6 years mark.</p>
          <p>First, we find the vested amount for this timestamp. It is 0.65.</p>
          <p>After that we trim the lockup schedule at that amount.</p>
          <p>In this case, the intersection is at 3.3 year mark.</p>
          <p>The trimmed lockup schedule capped by the horizontal red line at 0.65 of the amount.</p>
        </div>
      </div>
    </div>
  );
}
