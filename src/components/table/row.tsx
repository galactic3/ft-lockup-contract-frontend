import { useContext, useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link } from 'react-router-dom';
import { convertAmount, convertTimestamp } from '../../utils';
import { INearProps, NearContext } from '../../services/near';

export default function Row(props: { row: ReturnType<any>, token: string | null }) {
  const [open, setOpen] = useState(false);
  const { row, token } = props;
  const {
    near,
  }: {
    near: INearProps | null
  } = useContext(NearContext);

  if (!near) return null;

  const { signedIn } = near;
  console.log(token);

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
        <TableCell align="left"><Link to={signedIn ? `/admin/lockups/${row.account_id}` : `/lockups/${row.account_id}`}>{row.account_id}</Link></TableCell>
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
