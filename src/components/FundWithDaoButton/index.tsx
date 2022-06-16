import { useContext, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  InputLabel,
  MenuItem,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { INearProps, NearContext } from '../../services/near';
import { customFunctionCallProposalFormLink, ONE_YOKTO } from '../../services/DAOs/astroDAO/utils';

function FundWithDaoButton(props: { draftGroupIndex: number | undefined, amount: string | undefined }) {
  const { near }: { near: INearProps | null } = useContext(NearContext);
  const { draftGroupIndex, amount } = props;

  const defaultDescription = `Fund draft group ${draftGroupIndex} with amount ${amount}. Draft group link: ${window.location.href}`;
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

  if (amount === undefined) {
    throw Error('Cannot fund draft group without specified amount');
  }

  const { daos } = near.currentUser;

  const buildProposalLink = (): string => {
    const details = encodeURIComponent(description);
    const tokenContractAddress = near.tokenApi.getContract().contractId;
    const methodName = 'ft_transfer_call';
    const json = {
      receiver_id: near.api.getContract().contractId,
      amount,
      msg: JSON.stringify({ draft_group_id: draftGroupIndex }),
    };
    const actionsGas = '100'; // with this amount transaction completes in one go (without resubmit with additional gas)
    const actionDeposit = ONE_YOKTO;

    return customFunctionCallProposalFormLink(
      astroDAOContractAddress,
      details,
      tokenContractAddress,
      methodName,
      json,
      actionsGas,
      actionDeposit,
    );
  };

  const handleContractAddressChange = (event: SelectChangeEvent) => {
    console.log('EEEEE', event.target.value);
    setAstroDAOContractAddress(event.target.value as string);
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleFund = () => {
    window.open(buildProposalLink(), '_blank')?.focus();
  };

  console.log('DAOS', near.currentUser.daos);

  return (
    <div>
      <button className="button fullWidth" type="button" onClick={handleOpen}>Fund with DAO</button>
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
          <DialogContent style={{ paddingTop: '1.25em' }}>
            <InputLabel>Select DAO contract address</InputLabel>
            <Select
              sx={{ marginBottom: 3, width: 1 }}
              value={astroDAOContractAddress}
              onChange={handleContractAddressChange}
            >
              {daos.map((dao) => <MenuItem value={dao}>{dao}</MenuItem>)}
            </Select>
            <TextField
              sx={{ width: 1 }}
              id="outlined-multiline-static"
              label="Proposal description"
              multiline
              minRows={5}
              onChange={handleDescriptionChange}
              defaultValue={description}
            />
          </DialogContent>
          <DialogActions sx={{ padding: '14px 24px 24px' }}>
            <button className="button fullWidth noMargin" type="submit">Fund</button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

export default FundWithDaoButton;
