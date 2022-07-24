import { useState, useContext } from 'react';
import {
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Big } from 'big.js';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useLocation } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSnackbar } from 'notistack';

import TimestampDateDisplay from '../TimestampDateDisplay';
import Chart from '../Chart';
import { formatTokenAmount } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import TokenAmountDisplay from '../TokenAmountDisplay';
import ScheduleTable from '../ScheduleTable';
import { chartData } from '../../services/chartHelpers';
import { lockupTotalBalance } from '../../services/spreadsheetImport';
import { interpolateSchedule } from '../../services/scheduleHelpers';

type TBalancesRaw = {
  claimed: string,
  unclaimed: string,
  vested: string,
  unvested: string,
  total: string,
};

const calcBalancesRaw = (row: any, now: number): TBalancesRaw => {
  const totalBalanceRaw = row.schedule[row.schedule.length - 1].balance;
  const claimedBalanceRaw = '0';

  const m1 = interpolateSchedule;
  const m2 = lockupTotalBalance;
  console.log(m1, m2);

  const unclaimedBalanceRaw = interpolateSchedule(row.schedule, now).balance;
  let vestedBalanceFullRaw = null;
  const vestingSchedule = row.vesting_schedule?.Schedule;
  if (vestingSchedule) {
    vestedBalanceFullRaw = interpolateSchedule(vestingSchedule, now).balance;
  } else {
    vestedBalanceFullRaw = lockupTotalBalance(row);
  }
  const vestedBalanceRaw = new Big(vestedBalanceFullRaw)
    .sub(new Big(claimedBalanceRaw))
    .sub(new Big(unclaimedBalanceRaw))
    .toString();
  const unvestedBalanceRaw = new Big(totalBalanceRaw)
    .sub(new Big(vestedBalanceFullRaw))
    .toString();
  console.log(totalBalanceRaw, claimedBalanceRaw, unclaimedBalanceRaw, vestedBalanceRaw, unvestedBalanceRaw);

  return {
    claimed: claimedBalanceRaw,
    unclaimed: unclaimedBalanceRaw,
    vested: vestedBalanceRaw,
    unvested: unvestedBalanceRaw,
    total: totalBalanceRaw,
  };
};

export default function DraftsTableRow(props: { pageIndex: number, row: ReturnType<any>, token: TMetadata, adminControls: boolean, progressShow: boolean }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const {
    pageIndex, row, token, adminControls, progressShow,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    near,
  }: {
    near: INearProps | null
  } = useContext(NearContext);

  const [now, _setNow] = useState<number>(Math.floor(new Date().getTime() / 1000));

  if (!near) return null;

  if (row instanceof Error) {
    return (
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <div className="row-error">
            {'row '}
            {pageIndex}
            {': '}
            {row.message}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const vestingSchedule = row?.vesting_schedule?.Schedule;

  const currentContractName = location.pathname.split('/')[1];

  const selectedDraftId = location.pathname.split('/').pop() === row.id.toString();
  const draftPage = location.pathname.split('/').includes('drafts');
  const importDraftPage = location.pathname.split('/').includes('import_draft_group');

  const balancesRaw = calcBalancesRaw(row, now);

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
          {selectedDraftId && draftPage || importDraftPage
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
          {!importDraftPage && (
          <CopyToClipboard
            text={`${window.location.origin}/#/${currentContractName}/drafts/${row.id}`}
            onCopy={() => enqueueSnackbar('Copied', { variant: 'success', autoHideDuration: 1000 })}
          >
            <IconButton aria-label="copy link">
              <LinkIcon />
            </IconButton>
          </CopyToClipboard>
          )}
        </TableCell>
        <TableCell align="left">
          {row.account_id}
        </TableCell>
        <TableCell align="right">
          <TimestampDateDisplay unixSeconds={row.schedule[0].timestamp} />
        </TableCell>
        <TableCell align="right">
          <TimestampDateDisplay unixSeconds={row.schedule[row.schedule.length - 1].timestamp} />
        </TableCell>
        <TableCell align="right">
          <TokenAmountDisplay amount={balancesRaw.total} token={token} />
        </TableCell>
        {progressShow && (
        <TableCell align="center">
          <Tooltip
            title={(
              <div className="progress-bar__tooltip">
                <span>
                  <i className="claimed">&nbsp;</i>
                  <b>{formatTokenAmount(balancesRaw.claimed, token.decimals)}</b>
                  {' '}
                  Claimed
                </span>
                <span>
                  <i className="available">&nbsp;</i>
                  <b>{formatTokenAmount(balancesRaw.unclaimed, token.decimals)}</b>
                  {' '}
                  Available
                </span>
                <span>
                  <i className="vested">&nbsp;</i>
                  <b>{formatTokenAmount(balancesRaw.vested, token.decimals)}</b>
                  {' '}
                  Vested
                </span>
                <span>
                  <i className="unvested">&nbsp;</i>
                  <b>{formatTokenAmount(balancesRaw.unvested, token.decimals)}</b>
                  {' '}
                  Unvested
                </span>
              </div>
)}
            placement="top"
            arrow
          >
            <div className="progress-bar">
              <div style={{ width: `${(parseFloat(balancesRaw.claimed) / parseFloat(balancesRaw.total)) * 100}%` }} className="claimed">
                &nbsp;
              </div>
              <div style={{ width: `${(parseFloat(balancesRaw.unclaimed) / parseFloat(balancesRaw.total)) * 100}%` }} className="available">
                &nbsp;
              </div>
              <div style={{ width: `${(parseFloat(balancesRaw.vested) / parseFloat(balancesRaw.total)) * 100}%` }} className="vested">
                &nbsp;
              </div>
              <div style={{ width: `${(parseFloat(balancesRaw.unvested) / parseFloat(balancesRaw.total)) * 100}%` }} className="unvested">
                &nbsp;
              </div>
            </div>
          </Tooltip>
        </TableCell>
        )}
      </TableRow>
      <TableRow sx={{ background: '#F4F7FC' }}>
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="lockup-row">
              <ScheduleTable schedule={row.schedule} title="Lockup schedule" token={token} />
              {vestingSchedule && (
                <ScheduleTable schedule={vestingSchedule} title="Vesting schedule" token={token} />
              )}
              <div className="lockup-row-column chart">
                <div style={{ height: 300 }}>
                  <Chart data={chartData([row], token.decimals)} />
                </div>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
