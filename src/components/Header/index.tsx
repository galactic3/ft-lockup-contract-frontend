import { Link } from 'react-router-dom';
import Authorize from './Authorize';

export default function Header() {
  return (
    <div>
      <div className="float-right">
        <Authorize />
      </div>
      <div className="tabs">
        <Link to="/">About</Link>
        {' '}
        <Link to="/users">Users</Link>
      </div>
    </div>
  );
}
