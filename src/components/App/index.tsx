import { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';
import About from '../../pages/About';
import Users from '../../pages/Users';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';

export default function App() {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [contractState, setContractState] = useState({});

  if (!near) return null;

  // console.log(near);

  (async () => {
    const lockups = await near.api.loadAllLockups();

    setContractState({ name: 'name', lockups });
  })();

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<About contractState={contractState} />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:userId" element={<UserLockups />} />
      </Routes>
    </BrowserRouter>
  );
}
