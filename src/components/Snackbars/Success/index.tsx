import { forwardRef, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import { useSnackbar, SnackbarContent } from 'notistack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles(() => ({
  root: {
    '@media (min-width:600px)': {
      minWidth: '410px !important',
      minHeight: '120px !important',
    },
    boxShadow: '1px 7px 20px 0px rgba(0,0,0, 0.3) !important',
    borderRadius: '12px',
  },
  card: {
    width: '100%',
    padding: '24px',
    boxShadow: 'none',
    borderRadius: '12px',
  },
  actionRoot: {
    padding: 0,
    marginBottom: '8px',
    justifyContent: 'space-between',
  },
  typography1: {
    color: 'rgba(0, 185, 136, 1)',
    fontWeight: 700,
    fontSize: '16px',
  },
  icons: {
    marginLeft: 'auto',
  },
  expand: {
    padding: 0,
    transition: 'all .2s',
  },
  collapse: {
    padding: '8px',
    backgroundColor: '#F4F7FC',
    boxShadow: 'none',
    borderRadius: '8px',
  },
  typography2: {
    fontSize: '12px',
  },
  button: {
    padding: '0px 4px',
    textTransform: 'none',
    fontSize: '12px',
  },
}));

const Success = forwardRef((props: any, ref: any) => {
  const classes = useStyles();
  const { closeSnackbar } = useSnackbar();

  const handleDismiss = useCallback(() => {
    closeSnackbar(props.id);
  }, [props.id, closeSnackbar]);

  return (
    <SnackbarContent ref={ref} className={classes.root}>
      <Card className={classes.card}>
        <CardActions classes={{ root: classes.actionRoot }}>
          <Typography variant="subtitle2" className={classes.typography1}>
            {props.message}
          </Typography>
          <div className={classes.icons}>
            <IconButton className={classes.expand} onClick={handleDismiss}>
              <CloseIcon />
            </IconButton>
          </div>
        </CardActions>
        <Paper className={classes.collapse}>
          <Typography className={classes.typography2}>Success description</Typography>
          <Button size="small" className={classes.button}>
            Download now
          </Button>
        </Paper>
      </Card>
    </SnackbarContent>
  );
});

export default Success;