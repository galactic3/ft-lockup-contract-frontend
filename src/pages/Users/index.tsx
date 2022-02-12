import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';

export default function Users() {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  useEffect(() => {

  }, [near]);

  if (!near) return null;

  return (
    <div>
      <h1>Users</h1>

      This page should render list of all users that have lockups.

      <ul>
        {['alice', 'bob', 'charlie'].map((name) => (
          <li>
            <Link to={`/users/${name}.testnet`}>
              {name}
              .testnet
            </Link>
          </li>
        ))}
      </ul>

    </div>
  );
}
