import { useContext, useState } from 'react';
import {
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useLocation } from 'react-router-dom';

import LinkIcon from '@mui/icons-material/Link';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { convertAmount, convertTimestamp } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import TokenIcon from '../TokenIcon';
import ScheduleTable from '../ScheduleTable';

export default function DraftsTableRow(props: { row: ReturnType<any>, token: TMetadata, adminControls: boolean, progressShow: boolean }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const {
    row, token, adminControls, progressShow,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    near,
  }: {
    near: INearProps | null
  } = useContext(NearContext);

  if (!near) return null;

  const vestingSchedule = row?.vesting_schedule?.Schedule;

  const currentContractName = location.pathname.split('/')[1];

  const selectedDraftId = location.pathname.split('/').pop() === row.id.toString();
  const draftPage = location.pathname.split('/').includes('drafts');

  const claimedAmount = `${convertAmount(row.claimed_balance, token.decimals)}`;
  const availbleAmount = `${convertAmount(row.unclaimed_balance, token.decimals)}`;
  const vestedAmount = `${convertAmount(row.total_balance - row.claimed_balance - row.unclaimed_balance, token.decimals)}`;
  const unvestedAmount = `${convertAmount(row.total_balance - row.total_balance, token.decimals)}`;

  return (
    <>
      <TableRow className={open ? 'expanded exp-row' : 'exp-row'} sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">
          {selectedDraftId && draftPage
            ? row.id
            : (
              <Link
                to={adminControls
                  ? `/${currentContractName}/admin/drafts/${row.id}`
                  : `/${currentContractName}/drafts/${row.id}`}
              >
                {row.id}
              </Link>
            )}
          <CopyToClipboard
            text={`${window.location.origin}/#/${currentContractName}/drafts/${row.id}`}
            onCopy={() => enqueueSnackbar('Copied', { variant: 'success', autoHideDuration: 1000 })}
          >
            <IconButton aria-label="copy link">
              <LinkIcon />
            </IconButton>
          </CopyToClipboard>
        </TableCell>
        <TableCell align="left">
          {row.account_id}
        </TableCell>
        <TableCell align="right">
          {convertTimestamp(row.schedule[0].timestamp)}
        </TableCell>
        <TableCell align="right">
          {convertTimestamp(row.schedule[row.schedule.length - 1].timestamp)}
        </TableCell>
        <TableCell align="right">
          {convertAmount(row.total_balance, token.decimals)}
          &nbsp;
          {token.symbol}
          &nbsp;
          <TokenIcon url={token.icon || ''} size={32} />
        </TableCell>
        {progressShow && (
        <TableCell align="center">
          <Tooltip
            title={(
              <div className="progress-bar__tooltip">
                <span>
                  <i className="claimed">&nbsp;</i>
                  <b>{claimedAmount}</b>
                  {' '}
                  Claimed
                </span>
                <span>
                  <i className="available">&nbsp;</i>
                  <b>{availbleAmount}</b>
                  {' '}
                  Available
                </span>
                <span>
                  <i className="vested">&nbsp;</i>
                  <b>{vestedAmount}</b>
                  {' '}
                  Vested
                </span>
                <span>
                  <i className="unvested">&nbsp;</i>
                  <b>{unvestedAmount}</b>
                  {' '}
                  Unvested
                </span>
              </div>
)}
            placement="top"
            arrow
          >
            <div className="progress-bar">
              <div style={{ width: `${(row.claimed_balance / row.total_balance) * 100}%` }} className="claimed">
                &nbsp;
              </div>
              <div style={{ width: `${(row.unclaimed_balance / row.total_balance) * 100}%` }} className="available">
                &nbsp;
              </div>
              <div style={{ width: `${((row.total_balance - row.claimed_balance - row.unclaimed_balance) / row.total_balance) * 100}%` }} className="vested">
                &nbsp;
              </div>
              <div style={{ width: `${(row.total_balance - row.total_balance) * 100}%` }} className="unvested">&nbsp;</div>
            </div>
          </Tooltip>
        </TableCell>
        )}
      </TableRow>
      <TableRow sx={{ background: '#F4F7FC' }}>
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="lockup-row">
              <div style={{ display: 'flex', gap: 20 }}>
                <ScheduleTable schedule={row.schedule} title="Lockup schedule" token={token} />
                {vestingSchedule && (
                  <ScheduleTable schedule={vestingSchedule} title="Vesting schedule" token={token} />
                )}
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
