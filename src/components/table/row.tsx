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
import TimestampDateDisplay from '../TimestampDateDisplay';
import TokenAmountDisplay from '../TokenAmountDisplay';
import Chart from '../Chart';
import { formatTokenAmount, toCompactString } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import { TLockup } from '../../services/api';
import TerminateLockup from '../TerminateLockup';
import TerminateWithDaoButton from '../TerminateWithDaoButton';
import ScheduleTable from '../ScheduleTable';
import { chartData } from '../../services/chartHelpers';
import { calcBalancesRaw } from '../../services/scheduleHelpers';
import { enqueueCustomSnackbar } from '../Snackbars/Snackbar';
import success from '../Snackbars/SuccessPartials';

export default function Row(props: { adminControls: boolean, row: TLockup, token: TMetadata }) {
  const location = useLocation();
  const currentContractName = location.pathname.split('/')[1];

  const [open, setOpen] = useState(false);
  const { adminControls, row, token } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    near,
  }: {
    near: INearProps | null
  } = useContext(NearContext);

  const [now, _setNow] = useState<number>(Math.floor(new Date().getTime() / 1000));

  const [hasBeenOpen, setHasBeenOpen] = useState<boolean>(false);

  if (!near) return null;

  const { isAdmin } = near.currentUser;

  const vestingSchedule = row?.termination_config?.vesting_schedule?.Schedule;

  const selectedAccountPage = window.location.href.split('/').pop() === row.account_id;

  const selectedLockupId = window.location.href.split('/').pop() === row.id.toString();

  const balancesRaw = calcBalancesRaw(row, now);

  const claimedAmount = `${formatTokenAmount(balancesRaw.claimed, token.decimals)}`;
  const availbleAmount = `${formatTokenAmount(balancesRaw.unclaimed, token.decimals)}`;
  const vestedAmount = `${formatTokenAmount(balancesRaw.vested, token.decimals)}`;
  const unvestedAmount = `${formatTokenAmount(balancesRaw.unvested, token.decimals)}`;

  let payerMessage;
  if (!row.termination_config?.beneficiary_id) {
    payerMessage = 'This lockup cannot be terminated';
  } else {
    payerMessage = `Unvested amount will return to ${row.termination_config?.beneficiary_id}`;
  }

  const terminatorId = row?.termination_config?.beneficiary_id;

  const terminateButton = (terminator: string) => {
    if (!adminControls) {
      return null;
    }
    return (
      <>
        <div>
          {isAdmin && (
            <TerminateLockup
              token={token}
              adminControls={adminControls}
              lockupIndex={row.id}
              config={row.termination_config}
              buttonText={terminator ? 'Terminate' : 'No termination config'}
              lockup={row}
            />
          )}
        </div>
        <div>
          <TerminateWithDaoButton
            accountId={row.account_id}
            token={token}
            adminControls={adminControls}
            lockupIndex={row.id}
            config={row.termination_config}
            buttonText={terminator ? 'Terminate with Dao' : 'No termination config'}
            lockup={row}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <TableRow className={open ? 'expanded exp-row' : 'exp-row'}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => { setOpen(!open); setHasBeenOpen(true); }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">
          {!selectedLockupId
            ? <Link to={`/${currentContractName}${adminControls ? '/admin' : ''}/lockups/${row.account_id}/${row.id}`}>{row.id}</Link>
            : row.id}
          {!selectedLockupId && (
          <CopyToClipboard
            text={`${window.location.origin}/#/${currentContractName}/lockups/${row.account_id}/${row.id}`}
            onCopy={() => enqueueCustomSnackbar(enqueueSnackbar, null, success.header('Copied'), { autoHideDuration: 1000 })}
          >
            <IconButton aria-label="copy link">
              <LinkIcon />
            </IconButton>
          </CopyToClipboard>
          )}
        </TableCell>
        <TableCell align="left">
          {!selectedAccountPage
            ? <Link to={`/${currentContractName}${adminControls ? '/admin' : ''}/lockups/${row.account_id}`}>{toCompactString(row.account_id)}</Link>
            : toCompactString(row.account_id)}
          {!selectedAccountPage
          && (
          <CopyToClipboard
            text={`${window.location.origin}/#/${currentContractName}/lockups/${row.account_id}`}
            onCopy={() => enqueueCustomSnackbar(enqueueSnackbar, null, success.header('Copied'), { autoHideDuration: 1000 })}
          >
            <IconButton aria-label="copy link">
              <LinkIcon />
            </IconButton>
          </CopyToClipboard>
          )}
        </TableCell>
        <TableCell align="right">
          <TimestampDateDisplay unixSeconds={row.schedule[0].timestamp} />
        </TableCell>
        <TableCell align="right">
          <TimestampDateDisplay unixSeconds={row.schedule[row.schedule.length - 1].timestamp} />
        </TableCell>
        <TableCell align="center">
          {vestingSchedule ? 'Yes' : 'No'}
        </TableCell>
        <TableCell align="right">
          <TokenAmountDisplay amount={row.total_balance} token={token} />
        </TableCell>
        <TableCell align="center">
          <Tooltip
            title={(
              <div className="progress-bar__tooltip">
                <span className="nowrap">
                  <i className="claimed">&nbsp;</i>
                  <b>{claimedAmount}</b>
                  {' '}
                  Claimed
                </span>
                <span className="nowrap">
                  <i className="available">&nbsp;</i>
                  <b>{availbleAmount}</b>
                  {' '}
                  Available
                </span>
                <span className="nowrap">
                  <i className="vested">&nbsp;</i>
                  <b>{vestedAmount}</b>
                  {' '}
                  Vested
                </span>
                <span className="nowrap">
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
            <div className="progress-bar-outer">
              <div className="progress-bar">
                <div style={{ width: `${balancesRaw.total === '0' ? '100' : (parseFloat(balancesRaw.claimed) / parseFloat(balancesRaw.total)) * 100}%` }} className="claimed">
                  &nbsp;
                </div>
                <div style={{ width: `${balancesRaw.total === '0' ? '0' : (parseFloat(balancesRaw.unclaimed) / parseFloat(row.total_balance)) * 100}%` }} className="available">
                  &nbsp;
                </div>
                <div style={{ width: `${balancesRaw.total === '0' ? '0' : (parseFloat(balancesRaw.vested) / parseFloat(row.total_balance)) * 100}%` }} className="vested">
                  &nbsp;
                </div>
                <div style={{ width: `${balancesRaw.total === '0' ? '0' : (parseFloat(balancesRaw.unvested) / parseFloat(row.total_balance)) * 100}%` }} className="unvested">
                  &nbsp;
                </div>
              </div>
            </div>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow className="expanded">
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            { hasBeenOpen && (
              <div className="lockup-row">
                <ScheduleTable schedule={row.schedule} title="Lockup schedule" token={token} />
                {vestingSchedule && (
                <ScheduleTable schedule={vestingSchedule} title="Vesting schedule" token={token} />
                )}

                <div className="lockup-row-column chart">
                  <div style={{ height: 300 }}>
                    <Chart data={chartData([row], token.decimals)} />
                  </div>

                  {adminControls && (
                  <div className="terminate">
                    <span className="fine-print">{payerMessage}</span>
                    {terminatorId && terminateButton(terminatorId)}

                  </div>
                  )}
                </div>
              </div>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
