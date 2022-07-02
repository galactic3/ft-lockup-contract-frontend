import Typography from '@mui/material/Typography';

const body = (text: string) => {
  const Body = function (makeStyles: Function) {
    const classes = makeStyles(() => ({
      typography: {
        fontSize: '12px',
      },
    }))();

    return <Typography className={classes.typography}>{text}</Typography>;
  };

  return Body;
};

const header = (text: string) => {
  const Header = function (makeStyles: Function) {
    const classes = makeStyles(() => ({
      typography: {
        color: 'rgba(0, 185, 136, 1)',
        fontWeight: 700,
        fontSize: '16px',
      },
    }))();

    return (
      <Typography variant="subtitle2" className={classes.typography}>
        {text}
      </Typography>
    );
  };

  return Header;
};

const success = { body, header };

export default success;
