import {
  StrictMode, useEffect, useMemo, useState,
} from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import App from './components/App';
import { NearContext, connectNear, INearProps } from './services/near';
import { TSuggestContext, SuggestContext } from './services/SuggestContext';

import './index.css';

function SnackbarCloseButton(props: { snackbarKey: any }) {
  const { snackbarKey } = props;
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)}>
      <CloseIcon style={{ color: 'white' }} />
    </IconButton>
  );
}

/* eslint react/no-unstable-nested-components: "off" */

export default function NearApp() {
  const [near, setNear] = useState<INearProps | null>(null);

  useEffect(() => {
    async function connect() {
      const nearConn: INearProps = await connectNear();
      setNear(nearConn);
    }

    try {
      connect();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const value = useMemo(() => ({
    near,
    signIn: () => { near?.api?.signIn(); },
    reSignIn: () => {
      if (!near) return;

      near.api.signOut();
      near.api.signIn();
    },
    signOut: () => {
      if (!near) return;

      near.api.signOut();
      setNear({
        ...near,
        currentUser: {
          signedIn: false,
          signedAccountId: null,
          isAdmin: false,
          isDraftOperator: false,
          isCouncilMember: false,
          daos: [],
        },
      });
    },
  }), [near]);

  const handleClose = () => {
    const url = new URL(window.location.href);
    const sp = new URLSearchParams(url.search);
    sp.delete('transactionHashes');
    url.search = sp.toString();
    window.history.pushState({}, null as any, url.toString());
  };

  const [suggestOpen, setSuggestOpen] = useState(true);
  const suggestValue: TSuggestContext = useMemo(() => ({
    open: suggestOpen,
    setOpen: setSuggestOpen,
  }), [suggestOpen, setSuggestOpen]);

  return (
    <StrictMode>
      <SuggestContext.Provider value={suggestValue}>
        <NearContext.Provider value={value}>
          <SnackbarProvider
            autoHideDuration={null}
            action={(snackbarKey) => <SnackbarCloseButton snackbarKey={snackbarKey} />}
            onClose={handleClose}
            maxSnack={5}
          >
            <App />
          </SnackbarProvider>
        </NearContext.Provider>
      </SuggestContext.Provider>
    </StrictMode>
  );
}
