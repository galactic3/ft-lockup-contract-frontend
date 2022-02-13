import { config } from '../../config';

export default function About(
  { lockups }: { lockups: any[] },
) {
  return (
    <div>
      <h1>About Page</h1>

      <pre>
        {`
          This page should render all useful info about contract,
          at least ft-lockup name, token name, contract ft balance,

          ft-lockup account id: ${config.contractName}

          Total number of lockups: ${lockups.length}
        `}
      </pre>

    </div>
  );
}
