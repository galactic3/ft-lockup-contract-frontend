import { useContext, useState } from 'react';

import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import TerminateModal from '../TerminateModal';

function TerminateWithDaoButton(
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
    buttonText,
  } = props;

  const [date, setDate] = useState<Date | null>(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [astroDAOContractAddress, setAstroDAOContractAddress] = useState('');

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminate = async () => {};

  const canTerminate = adminControls && config;

  const modalProps = {
    modal: {
      currentState: {
        value: open,
        setValue: setOpen,
      },
      handlers: {
        onClose: handleClose,
        onSubmit: handleTerminate,
      },
      dialog: {
        datePicker: {
          currentState: {
            value: date,
            setValue: setDate,
          },
          visible: true,
        },
        daoSelector: {
          currentState: {
            value: astroDAOContractAddress,
            setValue: setAstroDAOContractAddress,
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

export default TerminateWithDaoButton;
