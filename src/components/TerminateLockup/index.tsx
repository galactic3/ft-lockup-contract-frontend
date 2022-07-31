import { useContext, useState } from 'react';

import { TTerminationConfig, TLockup, TSchedule } from '../../services/api';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import { TerminateModal, TProps } from '../TerminateModal';
import { startOfDay, addDays } from '../../utils';

function TerminateLockup(
  props: {
    adminControls: boolean,
    lockupIndex: number | undefined,
    config: TTerminationConfig | null,
    token: TMetadata,
    buttonText: string,
    lockup: TLockup,
  },
) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const {
    adminControls,
    lockupIndex,
    config,
    token,
    buttonText,
    lockup,
  } = props;

  const [date, setDate] = useState<Date | null>(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    const newValue = addDays(startOfDay(new Date()), 1);
    console.log('setDate', newValue?.getTime());
    setDate(newValue);

    return setOpen(true);
  };
  const handleClose = () => setOpen(false);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminateLockup = async () => {
    const ts = date ? date.getTime() / 1000 : null;
    await near.api.terminate(lockupIndex, ts);
  };

  const canTerminate = adminControls && config;

  if (!lockup?.termination_config?.vesting_schedule?.Schedule) {
    console.log('lockup doesnt have termination config');
    return null;
  }
  const modalProps: TProps = {
    currentState: {
      value: open,
      setValue: setOpen,
    },
    schedule: lockup.schedule,
    vestingSchedule: lockup?.termination_config?.vesting_schedule?.Schedule as TSchedule,
    handlers: {
      onClose: handleClose,
      onSubmit: handleTerminateLockup,
    },
    dialog: {
      dateTimePicker: {
        currentState: {
          value: date,
          setValue: (newValue: Date | null) => {
            console.log('setDate', newValue?.getTime());
            setDate(newValue);
          },
        },
      },
    },
    token,
    lockup,
  };

  return (
    <>
      {canTerminate && (
        <button
          className="button"
          type="button"
          onClick={handleOpen}
        >
          {buttonText}
        </button>
      )}
      { open && <TerminateModal {...modalProps} /> }
    </>
  );
}

export default TerminateLockup;
