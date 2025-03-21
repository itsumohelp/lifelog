import SignIn from "./sign-in"
import SignOut from "./sign-out"
import { auth } from "../auth"


export default async function UserButton() {
    const session = await auth()

  if (!session?.user) {
    return <SignIn />
  } else {
    return (<div>{session.user.name} / {session.user.email}<SignOut /></div>)
  }
}