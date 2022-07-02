import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const body = (makeStyles: any) => {
  const classes = makeStyles(() => ({
    button: {
      padding: '0px 4px',
      textTransform: 'none',
      fontSize: '12px',
    },
  }))();

  return (
    <Button size="small" className={classes.button}>See transaction</Button>
  );
};

const header = (makeStyles: any) => {
  const classes = makeStyles(() => ({
    typography1: {
      color: 'rgba(255, 89, 78, 1)',
      fontWeight: 700,
      fontSize: '16px',
    },
  }))();

  return (
    <Typography variant="subtitle2" className={classes.typography1}>
      Failure header
    </Typography>
  );
};

export { body, header };
