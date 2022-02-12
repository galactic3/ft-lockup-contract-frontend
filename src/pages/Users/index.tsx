import { useContext, useEffect } from 'react';
import { INearProps, NearContext } from '../../services/near';

export default function Users() {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  useEffect(() => {

  }, [near]);

  if (!near) return null;

  return (
    <div>Users</div>
  );
}
