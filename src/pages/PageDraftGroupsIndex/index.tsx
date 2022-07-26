import { useEffect, useState, useContext } from 'react';
import {
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import useTitle from '../../services/useTitle';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import { formatTokenAmount } from '../../utils';
import TokenIcon from '../../components/TokenIcon';
import DeleteDraftGroupButton from '../../components/DeleteDraftGroupButton';

export default function PageDraftGroupsIndex({ token, adminControls }: { token: TMetadata, adminControls: boolean }) {
  useTitle('Draft Groups | FT Lockup', { restoreOnUnmount: true });

  const location = useLocation();
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroups, setDraftGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchDraftGroups = async () => {
      setDraftGroups([]);
      console.log('fetchDraftGroup called');
      if (!near) {
        return;
      }
      const result = await near.api.getDraftGroupsAll();
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
    <div className="main">
      <div className="container">
        <h1>
          All draft groups
        </h1>

        {draftGroups.length === 0 && (
          <div>
            There are no draft groups yet.
          </div>
        )}

        {draftGroups.length !== 0 && (
          <Table className="main-table" aria-label="collapsible table">
            <TableHead className="table-head">
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Funded</TableCell>
                <TableCell align="center">Number&nbsp;of&nbsp;lockups</TableCell>
                <TableCell align="right">Total&nbsp;amount</TableCell>
                {adminControls && <TableCell align="right" width="0%">Delete</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {draftGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell align="center">
                    <Link to={`/${currentContractName}/${adminControls ? 'admin/' : ''}draft_groups/${group.id}`}>{group.id}</Link>
                  </TableCell>
                  <TableCell align="center">{group.funded ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="center">{group.draft_indices.length}</TableCell>
                  <TableCell align="right">
                    {formatTokenAmount(group.total_amount, token.decimals)}
                  &nbsp;
                    {token.symbol}
                  &nbsp;
                    <TokenIcon url={token.icon || ''} size={32} />
                  </TableCell>
                  {adminControls && (
                    <TableCell align="right">
                      {!group.funded && (
                      <DeleteDraftGroupButton
                        draftGroupId={group.id}
                        draftIds={group.draft_indices}
                        disabled={group.funded}
                      />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {adminControls && (
        <Link to={importDraftGroupPath}>
          <button className="button" type="button">Import Draft Group</button>
        </Link>
        )}
      </div>
    </div>
  );
}
