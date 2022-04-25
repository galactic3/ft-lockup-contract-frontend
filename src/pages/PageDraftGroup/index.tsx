import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import DraftsTable from '../../components/DraftsTable';
import { TMetadata } from '../../services/tokenApi';
import { convertAmount } from '../../utils';
import { INearProps, NearContext } from '../../services/near';

export default function PageDraftGroup({ token }: { token: TMetadata }) {
  const draftGroupId = parseInt(useParams().draftGroupId || '', 10);
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const [draftGroup, setDraftGroup] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);

  console.log(token);
  console.log(draftGroup);
  console.log(setDraftGroup);

  useEffect(() => {
    const fetchDraftGroup = async () => {
      setDraftGroup(null);
      console.log('fetchDraftGroup called');
      if (!near) {
        return;
      }
      const result = await near.api.getDraftGroup(draftGroupId);
      console.log(result);
      setDraftGroup(result);
    };

    fetchDraftGroup(); // .catch(console.error);
  }, [near, draftGroupId]);

  useEffect(() => {
    const fetchDrafts = async () => {
      setDrafts([]);
      console.log('fetchDrafts called');
      if (!near) {
        return;
      }
      if (!draftGroup) {
        return;
      }
      const result = await near.api.getDrafts(draftGroup.draft_indices);
      console.log(result);
      setDrafts(result.map((x: any) => Object.assign(x[1].lockup, { id: x[0] })));
    };

    fetchDrafts(); // .catch(console.error);
  }, [near, draftGroup]);

  if (!draftGroup) {
    return null;
  }

  return (
    <div className="container">
      <h1>
        Draft group
        {' '}
        {draftGroupId}
      </h1>
      <div>
        Total amount:
        { convertAmount(draftGroup.total_amount, token.decimals) }
      </div>
      <div>
        Funded:
        { draftGroup.funded ? 'YES' : 'NO' }
      </div>

      <h3>Drafts</h3>

      <DraftsTable lockups={drafts} token={token} />
    </div>
  );
}
