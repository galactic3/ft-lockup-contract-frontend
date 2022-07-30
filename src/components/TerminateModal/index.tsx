import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import TokenAmountDisplay from '../TokenAmountDisplay';
import { interpolateSchedule, terminateScheduleAtAmount, terminateSchedule } from '../../services/scheduleHelpers';
import DaoSelector from '../WithDao/DaoSelector';
import DaoProposalDescription from '../WithDao/DaoProposalDescription';
import UTCDateTimePicker from '../UTCDateTimePicker';
import { startOfDay, addDays } from '../../utils';
import { TSchedule, TLockup } from '../../services/api';
import { TMetadata } from '../../services/tokenApi';
import Chart from '../Chart';
import { chartData } from '../../services/chartHelpers';

type TUIElement<Ctype> = {
  currentState: {
    value: Ctype,
    setValue: any,
  },
};

export type TProps = {
  currentState: {
    value: boolean,
    setValue: any,
  },
  schedule: TSchedule,
  vestingSchedule: TSchedule,
  handlers: {
    onClose: any,
    onSubmit: any,
  },
  dialog: {
    dateTimePicker: TUIElement<Date | null>,
    daoSelector?: TUIElement<string>,
    daoProposalDescription?: TUIElement<string>,
  },
  token: TMetadata,
  lockup: TLockup,
};

export function TerminateModal({
  currentState,
  schedule,
  vestingSchedule,
  handlers,
  dialog,
  token,
  lockup,
}: TProps) {
  console.log(schedule);
  const [terminationMode, setTerminationMode] = useState<string>(
    dialog.dateTimePicker.currentState.value ? 'with_timestamp' : 'now',
  );
  const calcDefaultTimestamp = () => addDays(startOfDay(new Date()), 1);

  const xMax = Math.max(
    schedule[schedule.length - 1].timestamp,
    schedule[schedule.length - 1].timestamp,
  );
  const terminationTimestamp = (
    (dialog.dateTimePicker.currentState.value && !Number.isNaN(dialog.dateTimePicker.currentState.value.getTime()))
      ? new Date(Math.max(dialog.dateTimePicker.currentState.value.getTime(), new Date().getTime()))
      : new Date()
  ).getTime() / 1_000;

  const vestedAmount: string = interpolateSchedule(vestingSchedule, terminationTimestamp).balance;

  const trimmedLockupSchedule = terminateScheduleAtAmount(lockup.schedule, vestedAmount, 0);
  const trimmedVestingSchedule = terminateSchedule(vestingSchedule, terminationTimestamp);

  const yMax = Math.max(
    parseFloat(vestingSchedule[vestingSchedule.length - 1].balance),
    parseFloat(vestingSchedule[vestingSchedule.length - 1].balance),
  ) / 10 ** token.decimals;

  const trimmedLockup = {
    schedule: trimmedLockupSchedule,
    termination_config: {
      vesting_schedule: {
        Schedule: trimmedVestingSchedule,
      },
    },
    claimed_balance: lockup.claimed_balance,
  };

  return (
    <Dialog open={currentState.value} sx={{ padding: 2 }} maxWidth="md" onClose={handlers.onClose}>
      <form className="form-submit">
        <DialogTitle>
          Terminate Lockup
          <IconButton
            aria-label="close"
            onClick={handlers.onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ minWidth: '720px' }}>
          <div style={{ height: 300 }}>
            <Chart data={chartData([trimmedLockup], token.decimals)} xMax={xMax} yMax={yMax} />
          </div>
          <div className="vested-amount-info">
            <div style={{ lineHeight: '30px' }}>
              Vested amount
              {terminationMode === 'now' ? ' (approximate)' : ''}
              :
            </div>
            <div>
              <TokenAmountDisplay amount={vestedAmount} token={token} />
            </div>
          </div>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
              value={terminationMode}
              onChange={(_event, newValue: string) => {
                setTerminationMode(newValue);
                if (newValue === 'with_timestamp') {
                  dialog.dateTimePicker.currentState.setValue(calcDefaultTimestamp());
                } else {
                  dialog.dateTimePicker.currentState.setValue(null);
                }
              }}
            >
              <FormControlLabel value="now" control={<Radio />} label="now" />
              <FormControlLabel value="with_timestamp" control={<Radio />} label="at specific timestamp" />
            </RadioGroup>
          </FormControl>
          <FormControl fullWidth sx={{ marginTop: '10px' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {dialog.dateTimePicker && (
                <UTCDateTimePicker
                  value={dialog.dateTimePicker.currentState.value}
                  setValue={(newValue) => {
                    dialog.dateTimePicker.currentState.setValue(newValue);
                  }}
                  label="Custom termination date and time"
                  minTime={new Date()}
                  disabled={!(terminationMode === 'with_timestamp')}
                />
              )}
            </LocalizationProvider>
          </FormControl>
          { dialog?.daoSelector && (
            <DaoSelector
              selectedAddress={dialog.daoSelector.currentState.value}
              setSelectedAddress={dialog.daoSelector.currentState.setValue}
            />
          ) }
          { dialog?.daoProposalDescription && (
            <DaoProposalDescription
              proposalDescription={dialog.daoProposalDescription.currentState.value}
              setProposalDescription={dialog.daoProposalDescription.currentState.setValue}
            />
          ) }
          <span style={{ minHeight: '40px' }} />
          <button
            className="button red fullWidth"
            style={{ marginTop: '20px' }}
            type="button"
            onClick={handlers.onSubmit}
            disabled={
              terminationMode === 'with_timestamp'
                && (
                  (
                    !dialog.dateTimePicker.currentState.value
                    || Number.isNaN(dialog.dateTimePicker.currentState.value.getTime())
                    || (
                      dialog.dateTimePicker.currentState.value.getTime() <= new Date().getTime()
                    )
                  )
                )
            }
          >
            Terminate
          </button>
        </DialogContent>
      </form>
    </Dialog>
  );
}
