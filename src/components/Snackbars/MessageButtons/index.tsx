import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useSnackbar } from 'notistack';
import { enqueueCustomSnackbar } from '../Snackbar';
import success from '../SuccessPartials';
import warning from '../WarningPartials';

const styles = {
  root: {
    flexGrow: 1,
    display: 'flex',
    margin: 16,
    justifyContent: 'center',
    alignItems: 'middle',
  },
  button: {
    margin: 8,
    borderColor: '#313131',
    color: '#313131',
  },
};

const MessageButtons = function () {
  const { enqueueSnackbar } = useSnackbar();

  const whateverLink = 'https://localhost:3000';
  const whateverHeader = 'Whatever header';

  let partial: any;

  if (1 * 2 === 2) {
    partial = warning;
  } else {
    partial = success;
  }

  const handleClick = () => enqueueCustomSnackbar(enqueueSnackbar, partial.body(whateverLink), partial.header(whateverHeader));

  return (
    <Paper style={styles.root}>
      <Button variant="outlined" style={styles.button} onClick={handleClick}>
        Show Snackbar
      </Button>
    </Paper>
  );
};

export default MessageButtons;