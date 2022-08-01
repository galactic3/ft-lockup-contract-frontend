import {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Routes, Route, HashRouter, Navigate,
} from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { txLinkInExplorer } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import About from '../../pages/About';
import ImportDraftGroup from '../ImportDraftGroup';
import PageDraftGroup from '../../pages/PageDraftGroup';
import PageDraftGroupsIndex from '../../pages/PageDraftGroupsIndex';
import NewLockupContract from '../../pages/NewLockupContract';
import Lockups from '../../pages/Lockups';
import UserLockups from '../../pages/UserLockups';
import Header from '../Header';
import Authorize from '../Authorize';
import RequireAuth from '../RequireAuth';
import { TMetadata } from '../../services/tokenApi';
import Homepage from '../../pages/Homepage';
import NotFoundContract from '../../pages/NotFoundContract';
import Footer from '../Footer';
import PageDraft from '../../pages/PageDraft';
import Terms from '../../pages/Terms';
import Privacy from '../../pages/Privacy';
import {
  claimSnack,
  storageDepositSnack,
  createLockupSnack,
  fundDraftGroupSnack,
  terminateLockupSnack,
} from '../Snackbars';
import { enqueueCustomSnackbar } from '../Snackbars/Snackbar';
import warning from '../Snackbars/WarningPartials';

import { parseTxResultUrl, fetchTxStatus } from '../../services/transactionResultParser';

function Customer({
  lockups, token, contractId, near,
}: {
  lockups: any, token: TMetadata, contractId: string | null, near: INearProps | null,
}) {
  if (!lockups) return null;

  return (
    <>
      <Header adminControls={false} />
      <Routes>
        <Route path="/" element={<Navigate replace to="lockups" />} />
        <Route path="/lockups" element={contractId && near && <Lockups lockups={lockups} token={{ ...token, contractId }} adminControls={false} />} />
        <Route path="/lockups/:userId" element={<UserLockups lockups={lockups} token={token} adminControls={false} />} />
        <Route path="/lockups/:userId/:id" element={<UserLockups lockups={lockups} token={token} adminControls={false} />} />
        <Route path="/draft_groups" element={<PageDraftGroupsIndex token={token} adminControls={false} />} />
        <Route path="/draft_groups/:draftGroupId" element={<PageDraftGroup token={token} adminControls={false} />} />
        <Route path="/drafts/:draftId" element={<PageDraft token={token} adminControls={false} />} />
        <Route path="*" element={<NotFoundContract />} />
      </Routes>
    </>
  );
}

function Admin({
  lockups, token, tokenContractId, near,
}: {
  lockups: any, token: TMetadata, tokenContractId: string | null, near: INearProps | null,
}) {
  if (!lockups) return null;

  const showLockups = tokenContractId && near;

  return (
    <>
      <Header adminControls />
      <Routes>
        <Route path="/" element={<Authorize />} />
        <Route path="/lockups" element={showLockups && <RequireAuth><Lockups lockups={lockups} token={{ ...token, contractId: tokenContractId }} adminControls /></RequireAuth>} />
        <Route path="/lockups/:userId" element={<RequireAuth><UserLockups lockups={lockups} token={token} adminControls /></RequireAuth>} />
        <Route path="/lockups/:userId/:id" element={<RequireAuth><UserLockups lockups={lockups} token={token} adminControls /></RequireAuth>} />
        <Route path="/draft_groups" element={<RequireAuth><PageDraftGroupsIndex token={token} adminControls /></RequireAuth>} />
        <Route path="/draft_groups/:draftGroupId" element={<RequireAuth><PageDraftGroup token={token} adminControls /></RequireAuth>} />
        <Route path="/drafts/:draftId" element={<RequireAuth><PageDraft token={token} adminControls /></RequireAuth>} />
        <Route path="/import_draft_group" element={<RequireAuth><ImportDraftGroup token={token} adminControls /></RequireAuth>} />
      </Routes>
    </>
  );
}

export default function App() {
  const { enqueueSnackbar } = useSnackbar();
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
    if (!enqueueSnackbar) return;
    if (!near) return;
    if (!token) return;
    if (token.spec === '') {
      return;
    }

    const perform = async () => {
      const txHash = parseTxResultUrl(window.location.search);

      if (!txHash) {
        return;
      }

      const txStatus = await fetchTxStatus(
        near.rpcProvider,
        near.api.getContract().contractId,
        txHash,
      );

      console.log('TX STATUS', txStatus);

      if (!txStatus) {
        return;
      }

      const { method } = txStatus;
      const methodName = method.name;
      const successValue = method.result;
      const unpacked = successValue && JSON.parse(atob(successValue));
      const { args } = method;
      const txMsg = args.msg && JSON.parse(args.msg);

      switch (methodName) {
        case 'claim':
          claimSnack(enqueueSnackbar, unpacked, txHash, token);
          break;
        case 'storage_deposit':
          storageDepositSnack(enqueueSnackbar, unpacked, txHash, token, args.account_id);
          break;
        case 'ft_transfer_call':
          if (txMsg.schedule) {
            createLockupSnack(enqueueSnackbar, unpacked, txHash, token, txMsg);
            break;
          }

          if (Number.isInteger(txMsg.draft_group_id)) {
            fundDraftGroupSnack(enqueueSnackbar, unpacked, txHash, token, txMsg);
            break;
          }

          enqueueCustomSnackbar(
            enqueueSnackbar,
            warning.body(`Transaction performed, TODO ${txHash}!`),
            warning.header('Warning'),
          );
          break;
        case 'terminate':
          terminateLockupSnack(enqueueSnackbar, unpacked, txHash, token, args.lockup_index);
          break;
        default:
          enqueueCustomSnackbar(
            enqueueSnackbar,
            warning.body(`UNHANDLED Transaction "${methodName}" : ${txLinkInExplorer(txHash)}`),
            warning.header('Warning'),
          );
          break;
      }
    };

    perform();
  }, [enqueueSnackbar, near, token]);

  useEffect(() => {
    let active = true;

    if (near && near.lockupContractFound) {
      const load = async () => {
        const lockups = await near.api.loadAllLockups();
        const metadata = await near.tokenApi.ftMetadata();
        if (!active) {
          return;
        }
        setToken(metadata);
        setContractState({ lockups, name: 'name' });
      };

      if (near.tokenContractId) {
        load();
      }
    }

    return () => { active = false; };
  }, [near, near?.lockupContractFound]);

  useEffect(() => {
    if (near && near.tokenApi) {
      setContractId(near.tokenApi.getContract().contractId);
    }

    return () => {};
  }, [near]);

  const { lockups }: any = contractState as any;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/new_lockup_contract/" element={<NewLockupContract />} />
        <Route
          path="/:cid/*"
          element={contractId && near && (
            near.lockupContractFound
              ? <Customer lockups={lockups} token={token} contractId={contractId} near={near} />
              : (near.lockupContractNone ? null : <NotFoundContract />)
          )}
        />
        <Route
          path="/:cid/admin/*"
          element={contractId && near && (
            near.lockupContractFound
              ? <Admin lockups={lockups} token={token} tokenContractId={contractId} near={near} />
              : (near.lockupContractNone ? null : <NotFoundContract />)
          )}
        />
        <Route path="*" element={<NotFoundContract />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
}
