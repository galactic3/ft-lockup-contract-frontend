import {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Routes, Route, HashRouter, Navigate,
} from 'react-router-dom';
import { INearProps, NearContext } from '../../services/near';
import About from '../../pages/About';
import ImportDraftGroup from '../ImportDraftGroup';
import PageDraftGroup from '../../pages/PageDraftGroup';
import PageDraftGroupsIndex from '../../pages/PageDraftGroupsIndex';
import Lockups from '../../pages/Lockups';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';
import Authorize from '../Authorize';
import RequireAuth from '../RequireAuth';
import { TMetadata } from '../../services/tokenApi';

function Customer({
  lockups, token, contractId,
}: { lockups: any[], token: TMetadata, contractId: string | null }) {
  return (
    <>
      <Header adminControls={false} />
      <Routes>
        <Route path="/" element={<Navigate replace to="/lockups" />} />
        <Route path="/about" element={<About lockups={lockups} token_account_id={contractId} />} />
        <Route path="/lockups" element={<Lockups lockups={lockups} token={token} adminControls={false} />} />
        <Route path="/lockups/:userId" element={<UserLockups lockups={lockups} token={token} adminControls={false} />} />
      </Routes>
    </>
  );
}

function Admin({ lockups, token, tokenContractId }: { lockups: any[], token: TMetadata, tokenContractId: string | null }) {
  return (
    <>
      <Header adminControls />
      <Routes>
        <Route path="/" element={<Authorize />} />
        <Route path="/about" element={<About lockups={lockups} token_account_id={tokenContractId} />} />
        <Route path="/lockups" element={<RequireAuth><Lockups lockups={lockups} token={token} adminControls /></RequireAuth>} />
        <Route path="/lockups/:userId" element={<RequireAuth><UserLockups lockups={lockups} token={token} adminControls /></RequireAuth>} />
        <Route path="/draft_groups" element={<RequireAuth><PageDraftGroupsIndex token={token} /></RequireAuth>} />
        <Route path="/draft_groups/:draftGroupId" element={<RequireAuth><PageDraftGroup token={token} /></RequireAuth>} />
        <Route path="/import_draft_group" element={<RequireAuth><ImportDraftGroup token={token} /></RequireAuth>} />
      </Routes>
    </>
  );
}

export default function App() {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [contractState, setContractState] = useState({});
  const [contractId, setContractId] = useState<string | null>(null);
  const [token, setToken] = useState<TMetadata>({
    decimals: 0,
    icon: null,
    name: '',
    reference: null,
    reference_hash: null,
    spec: '',
    symbol: '',
  });

  useEffect(() => {
    let active = true;

    if (near) {
      const load = async () => {
        const lockups = await near.api.loadAllLockups();
        const metadata = await near.tokenApi.ftMetadata();
        if (!active) {
          return;
        }
        setToken(metadata);
        setContractState({ lockups, name: 'name' });
      };

      load();
    }

    return () => { active = false; };
  }, [near]);

  useEffect(() => {
    if (near && near.tokenApi) {
      setContractId(near.tokenApi.getContract().contractId);
    }

    return () => {};
  }, [near]);

  if (Object.keys(contractState).length === 0) return null;

  const { lockups }: any = contractState as any;

  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<Customer lockups={lockups} token={token} contractId={contractId} />} />
        <Route path="/admin/*" element={<Admin lockups={lockups} token={token} tokenContractId={contractId} />} />
      </Routes>
    </HashRouter>
  );
}
