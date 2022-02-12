import { config } from '../../config';

export default function About() {
  return (
    <div>
      <h1>About Page</h1>

      This page should render all useful info about contract,
      at least ft-lockup name, token name, contract ft balance,

      ft-lockup account id:
      {config.contractName}
    </div>
  );
}
