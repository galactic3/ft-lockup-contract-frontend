import { useEffect, useState, useContext } from 'react';
import {
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import { convertAmount } from '../../utils';
import TokenIcon from '../../components/TokenIcon';

export default function PageDraftGroupsIndex({ token }: { token: TMetadata }) {
  const location = useLocation();
  console.log(location);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroups, setDraftGroups] = useState<any[]>([]);
  // const [drafts, setDrafts] = useState<any[]>([]);

  // console.log(token);
  // console.log(draftGroup);
  // console.log(setDraftGroup);

  useEffect(() => {
    const fetchDraftGroups = async () => {
      setDraftGroups([]);
      console.log('fetchDraftGroup called');
      if (!near) {
        return;
      }
      const result = await near.api.getDraftGroupsAll();
      console.log(result);
      setDraftGroups(result);
    };

    fetchDraftGroups(); // .catch(console.error);
  }, [near]);

  // useEffect(() => {
  //   const fetchDrafts = async () => {
  //     setDrafts([]);
  //     console.log('fetchDrafts called');
  //     if (!near) {
  //       return;
  //     }
  //     if (!draftGroup) {
  //       return;
  //     }
  //     const result = await near.api.getDrafts(draftGroup.draft_indices);
  //     console.log(result);
  //     setDrafts(result.map((x: any) => x[1].lockup));
  //   };

  //   fetchDrafts(); // .catch(console.error);
  // }, [near, draftGroup]);

  // if (!draftGroup) {
  //   return null;
  // }

  const currentContractName = location.pathname.split('/')[1];
  const importDraftGroupPath = `/${currentContractName}/admin/import_draft_group`;

  return (
    <div className="container">
      <h1>
        All draft groups
      </h1>

      <Table className="main-table" aria-label="collapsible table">
        <TableHead className="table-head">
          <TableRow>
            <TableCell align="left">ID</TableCell>
            <TableCell align="center">Funded</TableCell>
            <TableCell align="right">Number&nbsp;of&nbsp;lockups</TableCell>
            <TableCell align="right">Total&nbsp;amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {draftGroups.map((group) => (
            <TableRow>
              <TableCell align="left">
                <Link to={`/admin/draft_groups/${group.id}`}>{group.id}</Link>
              </TableCell>
              <TableCell align="center">{group.funded ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">{group.draft_indices.length}</TableCell>
              <TableCell align="right">
                {convertAmount(group.total_amount, token.decimals)}
                &nbsp;
                {token.symbol}
                &nbsp;
                <TokenIcon url={token.icon || ''} size={32} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <br />

      <Link to={importDraftGroupPath}>
        <button className="button" type="button">Import Draft Group</button>
      </Link>
    </div>
  );
}
