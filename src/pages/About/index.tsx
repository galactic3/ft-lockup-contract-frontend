import { config } from '../../config';

export default function About(
  { lockups, token_account_id }: { lockups: any[], token_account_id: string | null },
) {
  return (
    <div className="container">
      <h1>Fungible Token Lockup</h1>

      <h2>Purpose</h2>

      <div>
        Community Lockup is dApp implementing locking and vesting of any arbitrary fungible token on NEAR in the generally known sense of these words.
        <br />
        Lockup is a gradual release of tokens according to a specified schedule. After release tokens are in full control of the beneficiary.
        <br />
        Vesting is a gradual allocation of tokens to the beneficiary according to a specified schedule, provided certain conditions are met (for example, beneficiary keeps working for the payer).
        <br />
        Vested tokens are NOT immediately available to the beneficiary, however
        they WILL be available to the beneficiary according to the lockup
        schedule. Vested tokens are GUARANTEED to be received at some point in
        the future, while unvested token amount may be withdrawn by the payer if
        the lockup agreement is terminated.
      </div>

      <h2>Users</h2>

      <div>
        There are two roles in the app: payer (also called admin), most commonly the employer, and beneficiaries, most commonly the employees. There is also an implicit “anyone” role.

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
        Each lockup has the following fields:
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
        <div>
          <img src="https://bafkreidqdq6wefcvr436cunap4y5c77nodlgxu6c4qchxkd232g7377cw4.ipfs.nftstorage.link/" alt="Lockup and vesting schedule" />
        </div>
        Consider the following lockup with a four year duration.
        <br />
        The vesting schedule is red. One year cliff, then 1 / 4 is vested, then vesting is linear till the end (4 years mark).
        <br />
        The lockup schedule is blue. Two years cliff with zero amount. Then two years of linear lockup till 3 / 4 of the amount, then another cliff up to full amount.
        <br />
        Consider the termination happening at the 2.5 years mark.
        <br />
        First, we find the vested amount for this timestamp. It is 5 / 8.
        <br />
        After that we trim the lockup schedule at that amount.
        <br />
        In this case, the intersection is at 3y + 1 / 3y.
        <br />
        The trimmed lockup schedule is the yellow thin line. Note that it perfectly matches the initial lockup schedule up to the new total ( 5 / 8 ).
      </div>

      <h2>Technical Info</h2>

      <div>
        FT lockup account id:
        {' '}
        <span className="code">{config.contractName}</span>
      </div>
      <div>
        Token account id:
        {' '}
        <span className="code">{token_account_id}</span>
      </div>
      <div>
        Total number of lockups:
        {' '}
        <span className="code">{lockups.length}</span>
      </div>
    </div>
  );
}
