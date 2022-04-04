import { useState } from 'react';
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
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function Row(props: { row: ReturnType<any> }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  // @ts-ignore
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
        <TableCell align="left">{row.account_id}</TableCell>
        <TableCell align="right">{row.total_balance}</TableCell>
        <TableCell align="right">{row.claimed_balance}</TableCell>
        <TableCell align="right">{row.unclaimed_balance}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Lockup schedule
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.schedule.map((x: any) => (
                    <TableRow key={x.timestamp}>
                      <TableCell component="th" scope="row">
                        {x.timestamp}
                      </TableCell>
                      <TableCell>{x.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left">ID</TableCell>
              <TableCell align="left">Account ID</TableCell>
              <TableCell align="right">Total&nbsp;amount</TableCell>
              <TableCell align="right">Claimed&nbsp;amount</TableCell>
              <TableCell align="right">Available&nbsp;amount</TableCell>
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
