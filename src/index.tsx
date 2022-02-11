import {StrictMode, FC, useEffect, useState} from 'react'
import {render} from 'react-dom'
import { App } from "./components/App";
import { NearContext, connectNear, INearProps } from './services/near'

const NearApp: FC = () => {
    let [near, setNear] = useState<INearProps | null>(null);

    useEffect(() => {
        async function connect() {
            const near: INearProps = await connectNear()
            const accountId = await near.api.get_account_id()
            setNear({
                ...near,
                signedIn: !!accountId,
                signedAccountId: accountId,
            })
        }

        connect();
    }, []);

    return (
        <StrictMode>
            <NearContext.Provider value={{ near, setNear }}>
                <App />
            </NearContext.Provider>
        </StrictMode>
    )
}

render(
    <NearApp />,
    document.getElementById('root')
)
