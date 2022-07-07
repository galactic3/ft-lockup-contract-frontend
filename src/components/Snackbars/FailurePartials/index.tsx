import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { MouseEvent } from 'react';

const body = (transactionLink: string) => {
  const Body = function (makeStyles: any) {
    console.log(makeStyles);

    const onClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      window.open(transactionLink, '_blank');
    };

    return (
      <Button size="small" style={{ padding: '0px 4px', textTransform: 'none', fontSize: '12px' }} onClick={onClick}>
        See transaction
      </Button>
    );
  };

  return Body;
};

const header = (text: string) => {
  const Header = function (makeStyles: Function) {
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

  return Header;
};

const createDraftsBody = (notifBody: any) => {
  const button = function (linkText: { link: string, text: string }) {
    const { link, text } = linkText;

    const onClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      window.open(link, '_blank');
    };

    return (
      <>
        <Button
          size="small"
          style={
            {
              minWidth: 'inherit',
              padding: '0px 4px',
              textTransform: 'none',
              fontSize: '12px',
            }
          }
          onClick={onClick}
        >
          {text}
        </Button>
        <br />
      </>
    );
  };

  const CreateDreaftsBody = function () {
    return (
      <>
        <Typography style={{ fontSize: '12px' }}>{notifBody.text}</Typography>
        { notifBody.linksTexts.map((item: { link: string, text: string }) => button(item)) }
      </>
    );
  };

  return CreateDreaftsBody;
};

const failure = { body, header, createDraftsBody };

export default failure;
