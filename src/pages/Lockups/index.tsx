import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  convertAmount,
  convertTimestamp,
} from '../../utils';

function Row(props: { row: ReturnType<any> }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  // @ts-ignore
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
        <TableCell align="left">{row.id}</TableCell>
        <TableCell align="left"><Link to={`/lockups/${row.account_id}`}>{row.account_id}</Link></TableCell>
        <TableCell align="right">
          {convertTimestamp(row.schedule[0].timestamp)}
        </TableCell>
        <TableCell align="right">
          {convertTimestamp(row.schedule[row.schedule.length - 1].timestamp)}
        </TableCell>
        <TableCell align="right">
          {convertAmount(row.total_balance)}
          &nbsp;TOKEN
        </TableCell>
        <TableCell align="center">
          <div className="progress-bar">
            <div style={{ width: `${(row.claimed_balance / row.total_balance) * 100}%` }} className="claimed">
              <span>{convertAmount(row.claimed_balance)}</span>
            </div>
            <div style={{ width: `${(row.unclaimed_balance / row.total_balance) * 100}%` }} className="available">
              <span>
                {(row.unclaimed_balance / row.total_balance) > 0.2
                  && convertAmount(row.unclaimed_balance)}
              </span>
            </div>
            <div style={{ width: `${((row.total_balance - row.claimed_balance - row.unclaimed_balance) / row.total_balance) * 100}%` }} className="vested">
              <span>
                {((row.total_balance - row.claimed_balance - row.unclaimed_balance)
                  / row.total_balance) > 0.2 && convertAmount(row.total_balance
                  - row.claimed_balance - row.unclaimed_balance)}
              </span>
            </div>
            <div style={{ width: `${(row.total_balance - row.total_balance) * 100}%` }} className="unvested">&nbsp;</div>
          </div>
        </TableCell>
      </TableRow>
      <TableRow sx={{ background: '#F4FAFF' }}>
        <TableCell style={{ padding: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ padding: 2 }}>
              <div className="inner-table_wrapper">
                <h5>Lockup schedule</h5>
                <Table className="inner-table" size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>DATE</TableCell>
                      <TableCell>AMOUNT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.schedule.map((x: any) => (
                      <TableRow key={x.timestamp}>
                        <TableCell component="th" scope="row">
                          {convertTimestamp(x.timestamp)}
                        </TableCell>
                        <TableCell>
                          {convertAmount(x.balance)}
                          &nbsp;TOKEN
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Lockups({ lockups }: { lockups: any[] }) {
  const uniqueUsers = Array.from(new Set(lockups.map((x) => x.account_id)));

  console.log('unique users', uniqueUsers);

  return (
    <div className="container">

      <TableContainer sx={{ boxShadow: 'unset' }} component={Paper}>
        <Table className="main-table" aria-label="collapsible table">
          <TableHead className="table-head">
            <TableRow>
              <TableCell />
              <TableCell align="left">ID</TableCell>
              <TableCell align="left">Account ID</TableCell>
              <TableCell align="right">Start&nbsp;date</TableCell>
              <TableCell align="right">End&nbsp;date</TableCell>
              <TableCell align="right">Total&nbsp;amount</TableCell>
              <TableCell align="center">Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lockups.map((lockup) => (
              <Row key={lockup.id} row={lockup} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </div>
  );
}
