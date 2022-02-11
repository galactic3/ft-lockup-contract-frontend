import {Dispatch, ReactNode} from 'react'
import {INearProps} from "../../services/near";

function Auth(props: { open: boolean, children: ReactNode }) {
  return <div>{props.children}</div>;
}

const Authorize = ({ near, setNear }: { near: INearProps | null, setNear: Dispatch<INearProps | null> }) => {
  
  if (!near) return null;

  const { api, signedIn, signedAccountId } = near
  
  const handleSignIn = async () => {
    api.signIn()
  }

  const handleSignOut = async () => {
    api.signOut()
    setNear({
      ...near,
      signedIn: false, 
      signedAccountId: null
    })
  }

  if (signedIn) {
    return (
      <Auth open={false}>
        <div>{signedAccountId}</div>
        <button onClick={handleSignOut} />
      </Auth>
    )
  }

  return (
    <Auth open={false}>
      <button onClick={handleSignIn}>Sign In</button>
    </Auth>
  )

}
export default Authorize

