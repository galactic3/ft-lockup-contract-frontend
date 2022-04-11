import { Link } from 'react-router-dom';
import CreateLockup from './CreateLockup';

export default function Header() {
  return (
    <div className="header">
      <div className="container">
        <div className="nav">
          <Link className="nav-link" to="/lockups">Lockups</Link>
          <Link className="nav-link" to="/">About</Link>
        </div>
        <div className="float-right">
          <CreateLockup />
        </div>
      </div>
    </div>
  );
}
