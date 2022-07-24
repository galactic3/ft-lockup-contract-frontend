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
import { Link } from 'react-router-dom';
import { Big } from 'big.js';

import TimestampDateDisplay from '../TimestampDateDisplay';
import TokenAmountDisplay from '../TokenAmountDisplay';
import Chart from '../Chart';
import { formatTokenAmount } from '../../utils';
import { INearProps, NearContext } from '../../services/near';
import { TMetadata } from '../../services/tokenApi';
import { TLockup } from '../../services/api';
import TerminateLockup from '../TerminateLockup';
import TerminateWithDaoButton from '../TerminateWithDaoButton';
import ScheduleTable from '../ScheduleTable';
import { chartData } from '../../services/chartHelpers';

export default function Row(props: { adminControls: boolean, row: TLockup, token: TMetadata }) {
  const [open, setOpen] = useState(false);
  const { adminControls, row, token } = props;
  const {
    near,
  }: {
    near: INearProps | null
  } = useContext(NearContext);

  if (!near) return null;

  const { isAdmin } = near.currentUser;

  const vestingSchedule = row?.termination_config?.vesting_schedule?.Schedule;

  const selectedAccountPage = window.location.href.split('/').pop() === row.account_id;

  const selectedLockupId = window.location.href.split('/').pop() === row.id.toString();

  // TODO: calculate vested amount, unvested amount
  const claimedAmount = `${formatTokenAmount(row.claimed_balance, token.decimals)}`;
  const availbleAmount = `${formatTokenAmount(row.unclaimed_balance, token.decimals)}`;
  const vestedAmount = `${formatTokenAmount(new Big(row.total_balance).sub(new Big(row.claimed_balance)).sub(new Big(row.unclaimed_balance)).toFixed(0), token.decimals)}`;
  const unvestedAmount = `${formatTokenAmount('0', token.decimals)}`;

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
          />
        </div>
      </>
    );
  };

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
          {!selectedLockupId ? <Link to={`${row.id}`}>{row.id}</Link> : row.id}
        </TableCell>
        <TableCell align="left">
          {!selectedAccountPage && !selectedLockupId ? <Link to={row.account_id}>{row.account_id}</Link> : row.account_id}
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
              <div style={{ width: `${row.total_balance === '0' ? '100' : (parseFloat(row.claimed_balance) / parseFloat(row.total_balance)) * 100}%` }} className="claimed">
                &nbsp;
              </div>
              <div style={{ width: `${row.total_balance === '0' ? '0' : (parseFloat(row.unclaimed_balance) / parseFloat(row.total_balance)) * 100}%` }} className="available">
                &nbsp;
              </div>
              <div
                style={{
                  width: `${row.total_balance === '0' ? '0' : (
                    (
                      parseFloat(row.total_balance)
                      - parseFloat(row.claimed_balance)
                      - parseFloat(row.unclaimed_balance)
                    )
                    / parseFloat(row.total_balance)
                  ) * 100}%`,
                }}
                className="vested"
              >
                &nbsp;
              </div>
              <div style={{ width: `${row.total_balance === '0' ? '0' : (0) * 100}%` }} className="unvested">&nbsp;</div>
            </div>
          </Tooltip>
        </TableCell>
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

                <div className="terminate">
                  <span className="fine-print">{payerMessage}</span>
                  {terminatorId && terminateButton(terminatorId)}

                </div>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
