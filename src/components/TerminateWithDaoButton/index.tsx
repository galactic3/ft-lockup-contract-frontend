import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { TMetadata } from '../../services/tokenApi';
import { INearProps, NearContext } from '../../services/near';
import TerminateModal from '../TerminateModal';
import { buildTerminateLockupProposalLink } from '../../services/DAOs/astroDAO/utils';

function TerminateWithDaoButton(
  props: {
    accountId: string,
    adminControls: boolean,
    lockupIndex: number | undefined,
    config: { beneficiary_id: String, vesting_schedule: [] | null } | null,
    token: TMetadata,
    buttonText: string,
  },
) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const {
    accountId,
    adminControls,
    lockupIndex,
    config,
    buttonText,
  } = props;

  const [date, setDate] = useState<Date | null>(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const location = useLocation();

  const currentContractName = location.pathname.split('/')[1];
  const pathname = `/${currentContractName}/lockups/${accountId}/${lockupIndex}`;
  const uri = new URL(window.location.href);
  uri.hash = `#${pathname}`;
  const defaultDescription = `Terminate lockup ${lockupIndex}. Lockup link: ${uri.toString()}`;

  const [description, setDescription] = useState(defaultDescription);
  const [astroDAOContractAddress, setAstroDAOContractAddress] = useState((config?.beneficiary_id || '') as string);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (lockupIndex === undefined) {
    throw Error('Cannot terminate lockup without lockupIndex');
  }

  const handleTerminate = () => {
    const link = buildTerminateLockupProposalLink(
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
        className="button"
        disabled={!canTerminate}
        type="button"
        onClick={handleOpen}
        style={{ marginTop: 0 }}
      >
        {buttonText}
      </button>
      { open && <TerminateModal {...modalProps} /> }
    </div>
  );
}

export default TerminateWithDaoButton;
