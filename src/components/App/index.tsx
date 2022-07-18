import {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Routes, Route, HashRouter, Navigate,
} from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Big from 'big.js';

import { txLinkInExplorer, nearTo } from '../../utils';
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
        <Route path="/about" element={<About lockups={lockups} token_account_id={contractId} />} />
        <Route path="/lockups" element={contractId && near && <Lockups lockups={lockups} token={{ ...token, contractId }} adminControls={false} />} />
        <Route path="/lockups/:userId" element={<UserLockups lockups={lockups} token={token} adminControls={false} />} />
        <Route path="/lockups/:userId/:id" element={<UserLockups lockups={lockups} token={token} adminControls={false} />} />
        <Route path="/draft_groups" element={<PageDraftGroupsIndex token={token} adminControls={false} />} />
        <Route path="/draft_groups/:draftGroupId" element={<PageDraftGroup token={token} adminControls={false} />} />
        <Route path="/drafts/:draftId" element={<PageDraft token={token} adminControls={false} />} />
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
        <Route path="/about" element={<About lockups={lockups} token_account_id={tokenContractId} />} />
        <Route path="/lockups" element={showLockups && <RequireAuth><Lockups lockups={lockups} token={{ ...token, contractId: tokenContractId }} adminControls /></RequireAuth>} />
        <Route path="/lockups/:userId" element={<RequireAuth><UserLockups lockups={lockups} token={token} adminControls /></RequireAuth>} />
        <Route path="/lockups/:userId/:id" element={<RequireAuth><UserLockups lockups={lockups} token={token} adminControls /></RequireAuth>} />
        <Route path="/draft_groups" element={<RequireAuth><PageDraftGroupsIndex token={token} adminControls /></RequireAuth>} />
        <Route path="/draft_groups/:draftGroupId" element={<RequireAuth><PageDraftGroup token={token} adminControls /></RequireAuth>} />
        <Route path="/drafts/:draftId" element={<PageDraft token={token} adminControls />} />
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
      const searchParams = new URLSearchParams(window.location.search);
      const transactionHashesRaw: string | null = searchParams.get('transactionHashes');
      if (!transactionHashesRaw) {
        return;
      }
      const txHash = transactionHashesRaw.split(',')[0];
      console.log('txHash', txHash);
      const txStatus = await near.rpcProvider.txStatus(txHash, 'sender.testnet');
      console.log(txStatus);

      const methodName = txStatus.transaction.actions[0].FunctionCall.method_name;

      const successValue = (txStatus.status as any).SuccessValue;

      const args = JSON.parse(atob(txStatus.transaction.actions[0].FunctionCall.args));

      if (methodName === 'claim') {
        if (successValue) {
          const unpacked = JSON.parse(atob(successValue));
          if (unpacked !== '0') {
            const amount = new Big(unpacked).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
            enqueueSnackbar(`Claimed ${amount} ${token.symbol}`, { variant: 'success' });
            return;
          }
        }
        enqueueSnackbar(`Claim failed: ${txLinkInExplorer(txHash)}`, { variant: 'error' });
        return;
      }

      if (methodName === 'storage_deposit') {
        const unpacked = JSON.parse(atob(successValue));
        const amount = parseFloat(nearTo(unpacked.total, 9)).toString();
        console.log(amount);
        const accountId = args.account_id;
        const message = `Successfully paid ${amount}N for FT storage of ${accountId}`;
        enqueueSnackbar(message, { variant: 'success' });
        return;
      }

      if (methodName === 'ft_transfer_call') {
        const txMsg = JSON.parse(args.msg);
        console.log(txMsg);
        if (txMsg.schedule) {
          const unpacked = JSON.parse(atob(successValue));
          const amount = new Big(unpacked).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
          console.log(amount);
          const totalBalance = txMsg.schedule[txMsg.schedule.length - 1].balance;
          if (totalBalance === unpacked) {
            const statusMessage = `Created lockup for ${txMsg.account_id} with amount ${amount} ${token.symbol}`;
            enqueueSnackbar(statusMessage, { variant: 'success' });
            return;
          }

          const statusMessage = `Failed to create lockup for ${txMsg.account_id}: ${txLinkInExplorer(txHash)}`;
          enqueueSnackbar(statusMessage, { variant: 'error' });
          return;
        }
        if (txMsg.draft_group_id !== null) {
          const unpacked = JSON.parse(atob(successValue));
          const amount = new Big(unpacked).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
          console.log(amount);
          if (unpacked !== '0') {
            const statusMessage = `Funded draft group ${txMsg.draft_group_id} with amount ${amount} ${token.symbol}`;
            enqueueSnackbar(statusMessage, { variant: 'success' });
            return;
          }
          const statusMessage = `Failed to fund draft group ${txMsg.draft_group_id}: ${txLinkInExplorer(txHash)}`;
          enqueueSnackbar(statusMessage, { variant: 'error' });
          return;
        }

        enqueueSnackbar(`Transaction performed, TODO ${txHash}!`, { variant: 'warning' });
        return;
      }

      if (methodName === 'terminate') {
        if (successValue) {
          const unpacked = JSON.parse(atob(successValue));
          console.log(unpacked);
          const amount = new Big(unpacked).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
          const message = `Terminated lockup #${args.lockup_index}, unvested amount: ${amount}`;
          enqueueSnackbar(message, { variant: 'success' });
          return;
        }
        enqueueSnackbar(`Terminate lockup failed: ${txLinkInExplorer(txHash)}`, { variant: 'error' });
        return;
      }

      const message = `UNHANDLED Transaction "${methodName}" : ${txLinkInExplorer(txHash)}`;
      enqueueSnackbar(message, { variant: 'warning' });
    };

    perform();
  }, [enqueueSnackbar, near, token]);

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

      if (near.tokenContractId) {
        load();
      }
    }

    return () => { active = false; };
  }, [near]);

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
        <Route path="/" element={<Homepage lockups={lockups} />} />
        <Route path="/new_lockup_contract/" element={<NewLockupContract />} />
        <Route path="/:cid/*" element={contractId && near && <Customer lockups={lockups} token={token} contractId={contractId} near={near} />} />
        <Route path="/:cid/admin/*" element={contractId && near && <Admin lockups={lockups} token={token} tokenContractId={contractId} near={near} />} />
        <Route path="/:cid/not_found_contract/" element={<NotFoundContract />} />
        <Route path="*" element={<NotFoundContract />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
}
