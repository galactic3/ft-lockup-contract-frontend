import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useSnackbar } from 'notistack';
import Success from '../Success';

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

const success = (key:any, message:any) => <Success id={key} message={message} />;

const MessageButtons = function () {
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    enqueueSnackbar("You're report is ready", {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      content: success,
    });
  };

  return (
    <Paper style={styles.root}>
      <Button variant="outlined" style={styles.button} onClick={handleClick}>
        Show Snackbar
      </Button>
    </Paper>
  );
};

export default MessageButtons;
