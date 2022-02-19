import {
  StrictMode, useEffect, useMemo, useState,
} from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { NearContext, connectNear, INearProps } from './services/near';

import './index.css';

function NearApp() {
  const [near, setNear] = useState<INearProps | null>(null);

  useEffect(() => {
    async function connect() {
      const nearConn: INearProps = await connectNear();
      setNear(nearConn);
    }

    connect();
  }, []);

  const value = useMemo(() => ({
    near,
    signIn: () => { near?.api?.signIn(); },
    signOut: () => {
      if (!near) return;

      near.api.signOut();
      setNear({
        ...near,
        signedIn: false,
        signedAccountId: null,
      });
    },
  }), [near]);

  return (
    <StrictMode>
      <NearContext.Provider value={value}>
        <App />
      </NearContext.Provider>
    </StrictMode>
  );
}

render(
  <NearApp />,
  document.getElementById('root'),
);
