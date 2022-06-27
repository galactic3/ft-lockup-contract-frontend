import { useContext, useState } from 'react';

import { useSnackbar } from 'notistack';
import Big from 'big.js';
import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import TerminateModal from '../TerminateModal';

function TerminateLockup(
  props: {
    adminControls: boolean,
    lockupIndex: number | undefined,
    config: { beneficiary_id: String, vesting_schedule: [] | null } | null,
    token: TMetadata,
    buttonText: string,
  },
) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const {
    adminControls,
    lockupIndex,
    config,
    token,
    buttonText,
  } = props;

  const { enqueueSnackbar } = useSnackbar();
  const [date, setDate] = useState<Date | null>(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminateLockup = async () => {
    if (!enqueueSnackbar) return;

    const ts = date ? date.getTime() / 1000 : null;
    const result = await near.api.terminate(lockupIndex, ts);
    const amount = new Big(result as any).div(new Big(10).pow(token.decimals)).round(2, Big.roundDown);
    console.log(amount);
    const message = `Terminated lockup #${lockupIndex}, refunded ${amount} ${token.symbol}`;
    enqueueSnackbar(message, { variant: 'success' });
    setTimeout(() => window.location.reload(), 1000);
  };

  const canTerminate = adminControls && config;

  const modalProps = {
    modal: {
      currentState: {
        value: open,
        setValue: setOpen,
      },
      handlers: {
        onClose: handleClose,
        onSubmit: handleTerminateLockup,
      },
      dialog: {
        datePicker: {
          currentState: {
            value: date,
            setValue: setDate,
          },
          visible: true,
        },
      },
    },
  };

  return (
    <div>
      <button
        className="button red fullWidth"
        disabled={!canTerminate}
        type="button"
        onClick={handleOpen}
      >
        {buttonText}
      </button>
      { open && <TerminateModal {...modalProps.modal} /> }
    </div>
  );
}

export default TerminateLockup;
