import { useParams } from 'react-router-dom';

export default function UserLockups() {
  const { userId } = useParams();
  return (
    <div>
      <h1>User Lockups Page</h1>
      This page should render all active lockups for specific user.

      <h2>
        User:
        {' '}
        {userId}
      </h2>

      Lockups:
      <ul>
        {[2, 3, 5, 7, 11].map((idx) => (
          <li>
            #
            {idx}
            , amount: 100500
          </li>
        ))}
      </ul>
    </div>
  );
}
