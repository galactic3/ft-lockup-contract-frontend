import { useContext, Dispatch } from 'react';
import { Link } from 'react-router-dom';
import Authorize from './Authorize';
import { INearProps, NearContext } from '../../services/near';

export default function Header() {
  const {
    near, setNear,
  }: {
    near: INearProps | null, setNear: Dispatch<INearProps | null>,
  } = useContext(NearContext);

  return (
    <div>
      <div className="float-right">
        <Authorize near={near} setNear={setNear} />
      </div>
      <div className="tabs">
        <Link to="/">About</Link>
        {' '}
        <Link to="/users">Users</Link>
      </div>
    </div>
  );
}
