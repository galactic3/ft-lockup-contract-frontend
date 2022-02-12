import { useContext, Dispatch } from 'react';

import Authorize from './Authorize';
import { INearProps, NearContext } from '../../services/near';

export default function Header() {
  const {
    near, setNear,
  }: {
    near: INearProps | null, setNear: Dispatch<INearProps | null>,
  } = useContext(NearContext);

  return (
    <Authorize near={near} setNear={setNear} />
  );
}
