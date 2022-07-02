import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const body = (transactionLink: string) => {
  const Body = function (makeStyles: any) {
    const classes = makeStyles(() => ({
      button: {
        padding: '0px 4px',
        textTransform: 'none',
        fontSize: '12px',
      },
    }))();

    const onClick = (event: any) => {
      event.preventDefault();
      window.open(transactionLink, '_blank');
    };

    return (
      <Button size="small" className={classes.button} onClick={onClick}>
        See transaction
      </Button>
    );
  };

  return Body;
};

const header = (text: string) => {
  const Header = function (makeStyles: any) {
    const classes = makeStyles(() => ({
      typography: {
        color: 'rgba(255, 89, 78, 1)',
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

  console.log('header', Header);

  return Header;
};

export { body, header };
