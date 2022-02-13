import { config } from '../../config';

export default function About(
  { contractState }: { contractState: { name?: string, lockups?: any[] } },
) {
  return (
    <div>
      <h1>About Page</h1>

      <pre>
        {`
          props value from parent controller: count=${contractState.name || 'LOADING'}

          This page should render all useful info about contract,
          at least ft-lockup name, token name, contract ft balance,

          ft-lockup account id: ${config.contractName}

          Raw contract data: ${JSON.stringify(contractState.lockups, null, 2)}
        `}
      </pre>

    </div>
  );
}
