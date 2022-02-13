import { Link } from 'react-router-dom';

export default function Users({ lockups }: { lockups: any[] }) {
  const uniqueUsers = Array.from(new Set(lockups.map((x) => x.account_id)));

  console.log('unique users', uniqueUsers);

  return (
    <div>
      <h1>Users</h1>

      This page should render list of all users that have lockups.

      <ul>
        {uniqueUsers.map((name) => (
          <li key={name}>
            <Link to={`/users/${name}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  );
}
