import { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';
import About from '../../pages/About';
import Users from '../../pages/Users';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';

export default function App() {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [contractState, setContractState] = useState({});

  useEffect(() => {
    let active = true;

    if (near) {
      const load = async () => {
        console.log('LOADING DATA');
        const lockups = await near.api.loadAllLockups();
        if (!active) {
          return;
        }
        setContractState({ lockups, name: 'name' });
      };

      load();
    }

    return () => { active = false; };
  }, [near]);

  if (Object.keys(contractState).length === 0) return null;

  const { lockups }: any = contractState as any;

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<About contractState={contractState} />} />
        <Route path="/users" element={<Users lockups={lockups} />} />
        <Route path="/users/:userId" element={<UserLockups />} />
      </Routes>
    </BrowserRouter>
  );
}
