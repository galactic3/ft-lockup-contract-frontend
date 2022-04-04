import { config } from '../../config';

export default function About(
  { lockups, token_account_id }: { lockups: any[], token_account_id: string | null },
) {
  return (
    <div className="container">
      <h1>About Page</h1>

      <pre>
        {`
          This page should render all useful info about contract,
          at least ft-lockup name, token name, contract ft balance,

          ft-lockup account id: ${config.contractName}
          token account id: ${token_account_id}

          Total number of lockups: ${lockups.length}
        `}
      </pre>

    </div>
  );
}
