import Typography from '@mui/material/Typography';

const body = (text: string) => {
  const Body = function (makeStyles: any) {
    const classes = makeStyles(() => ({
      typography2: {
        fontSize: '12px',
      },
    }))();

    return <Typography className={classes.typography2}>{text}</Typography>;
  };

  return Body;
};

const header = (text: string) => {
  const Header = function (makeStyles: any) {
    const classes = makeStyles(() => ({
      typography1: {
        color: 'rgba(0, 185, 136, 1)',
        fontWeight: 700,
        fontSize: '16px',
      },
    }))();

    return (
      <Typography variant="subtitle2" className={classes.typography1}>
        {text}
      </Typography>
    );
  };

  return Header;
};

export { body, header };
