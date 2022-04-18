import {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Routes, Route, HashRouter,
} from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';
import About from '../../pages/About';
import Lockups from '../../pages/Lockups';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';
import Authorize from '../Authorize';
import RequireAuth from '../RequireAuth';

export default function App() {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [contractState, setContractState] = useState({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (near) {
      const load = async () => {
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

  useEffect(() => {
    if (near) {
      setToken(near.api.getTokenContract().contractId);
    }

    return () => { };
  }, [near]);

  if (Object.keys(contractState).length === 0) return null;

  const { lockups }: any = contractState as any;

  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/about" element={<About lockups={lockups} token_account_id={token} />} />
        <Route path="/lockups" element={<Lockups lockups={lockups} token={token} />} />
        <Route path="/lockups/:userId" element={<UserLockups lockups={lockups} token={token} />} />
        <Route path="/admin" element={<Authorize />} />
        <Route path="/admin/lockups" element={<RequireAuth><Lockups lockups={lockups} token={token} /></RequireAuth>} />
        <Route path="/admin/lockups/:userId" element={<RequireAuth><UserLockups lockups={lockups} token={token} /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
