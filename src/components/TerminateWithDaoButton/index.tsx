import { useContext, useState } from 'react';

import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import TerminateModal from '../TerminateModal';
import { buildiTerminateLockupProposalLink } from '../../services/DAOs/astroDAO/utils';

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

  const defaultDescription = `Terminate lockup ${lockupIndex}. Lockup link: ${window.location.href}`;
  const [description, setDescription] = useState(defaultDescription);
  const [astroDAOContractAddress, setAstroDAOContractAddress] = useState('');

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminate = () => {
    const link = buildiTerminateLockupProposalLink(
      description,
      near.api.getContract().contractId,
      lockupIndex,
      date ? date.getTime() / 1000 : null,
      astroDAOContractAddress,
    );

    window.open(link, '_blank')?.focus();
  };

  const canTerminate = adminControls && config;

  const modalProps = {
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
      },
      daoSelector: {
        currentState: {
          value: astroDAOContractAddress,
          setValue: setAstroDAOContractAddress,
        },
      },
      daoProposalDescription: {
        currentState: {
          value: description,
          setValue: setDescription,
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
      { open && <TerminateModal {...modalProps} /> }
    </div>
  );
}

export default TerminateWithDaoButton;
