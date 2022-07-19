import { useContext, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { INearProps, NearContext } from '../../services/near';
import { buildFundDraftGroupProposalLink } from '../../services/DAOs/astroDAO/utils';

import DaoSelector from '../WithDao/DaoSelector';
import DaoProposalDescription from '../WithDao/DaoProposalDescription';

function FundWithDaoButton(props: { draftGroupIndex: number | undefined, amount: any }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { draftGroupIndex, amount } = props;

  const defaultDescription = `Fund draft group ${draftGroupIndex} with amount ${amount?.label}. Draft group link: ${window.location.href.replace(/\/admin/, '')}`;
  const [description, setDescription] = useState(defaultDescription);
  const [astroDAOContractAddress, setAstroDAOContractAddress] = useState('');

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!near) {
    throw Error('Cannot access lockup api');
  }

  if (draftGroupIndex === undefined) {
    throw Error('Cannot fund draft group without index');
  }

  if (amount?.value === undefined) {
    throw Error('Cannot fund draft group without specified amount');
  }

  console.log('AMOUNT', amount);

  const handleFund = () => {
    const link = buildFundDraftGroupProposalLink(
      description,
      near.api.getContract().contractId,
      near.tokenApi.getContract().contractId,
      amount.value,
      draftGroupIndex,
      astroDAOContractAddress,
    );

    debugger;

    window.open(link, '_blank')?.focus();
  };

  return (
    <>
      <button className="button" type="button" onClick={handleOpen}>Fund with DAO</button>
      <Dialog open={open} sx={{ padding: 1, minWidth: 1 }} onClose={handleClose}>
        <form className="form-submit" onSubmit={handleFund}>
          <DialogTitle>
            Fund with DAO
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ minWidth: '320px', paddingTop: '1.25em' }}>
            <DaoSelector selectedAddress={astroDAOContractAddress} setSelectedAddress={setAstroDAOContractAddress} />
            <DaoProposalDescription proposalDescription={description} setProposalDescription={setDescription} />
          </DialogContent>
          <DialogActions sx={{ padding: '14px 24px 24px' }}>
            <button className="button fullWidth noMargin" type="submit">Fund</button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default FundWithDaoButton;
