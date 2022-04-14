import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div className="header">
      <div className="container">
        <div className="nav">
          <Link className="nav-link" to="/lockups">Lockups</Link>
          <Link className="nav-link" to="/about">About</Link>
        </div>
      </div>
    </div>
  );
}
