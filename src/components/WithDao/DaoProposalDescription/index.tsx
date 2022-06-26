import {
  TextField,
} from '@mui/material';

type TProps = {
  proposalDescription: string,
  setProposalDescription: Function,
};

function DaoProposalDescription({ proposalDescription, setProposalDescription }: TProps): any {
  const handleDescriptionChange = (e: any) => {
    setProposalDescription(e.target.value as string);
  };

  return (
    <TextField
      sx={{ width: 1 }}
      id="outlined-multiline-static"
      label="Proposal description"
      multiline
      minRows={5}
      onChange={handleDescriptionChange}
      defaultValue={proposalDescription}
    />
  );
}

export default DaoProposalDescription;
