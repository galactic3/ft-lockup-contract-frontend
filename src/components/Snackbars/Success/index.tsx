import Typography from '@mui/material/Typography';

const body = (makeStyles: any) => {
  const classes = makeStyles(() => ({
    typography2: {
      fontSize: '12px',
    },
  }))();

  return <Typography className={classes.typography2}>Success description</Typography>;
};

const header = (makeStyles: any) => {
  const classes = makeStyles(() => ({
    typography1: {
      color: 'rgba(0, 185, 136, 1)',
      fontWeight: 700,
      fontSize: '16px',
    },
  }))();

  return (
    <Typography variant="subtitle2" className={classes.typography1}>
      Success header
    </Typography>
  );
};

export { body, header };
