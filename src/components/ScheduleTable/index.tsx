import {
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
} from '@mui/material';
import { TSchedule } from '../../services/api';
import { TMetadata } from '../../services/tokenApi';
import TimestampDisplay from '../TimestampDisplay';
import { convertAmount } from '../../utils';
import TokenIcon from '../TokenIcon';

export default function ScheduleTable(params: { token: TMetadata, title: String, schedule: TSchedule }) {
  const { schedule, title, token } = params;

  return (
    <div className="inner-table_wrapper">
      <h5>{title}</h5>
      <Table className="inner-table" size="small" aria-label="purchases">
        <TableHead>
          <TableRow>
            <TableCell>DATE</TableCell>
            <TableCell align="right">CUMULATIVE AMOUNT</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((x: any) => (
            <TableRow key={x.timestamp}>
              <TableCell component="th" scope="row">
                <div className="nowrap">
                  <TimestampDisplay unixSeconds={x.timestamp} />
                </div>
              </TableCell>
              <TableCell align="right">
                <div className="nowrap">
                  {convertAmount(x.balance, token.decimals)}
                  &nbsp;
                  {token.symbol}
                  &nbsp;
                  <TokenIcon url={token.icon || ''} size={32} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
