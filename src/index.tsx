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
      const accountId = await nearConn.api.get_account_id();
      setNear({
        ...nearConn,
        signedIn: !!accountId,
        signedAccountId: accountId,
      });
    }

    connect();
  }, []);

  const value = useMemo(() => ({ near, setNear }), [near, setNear]);

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
