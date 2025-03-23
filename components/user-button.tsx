import SignIn from "./sign-in"
import SignOut from "./sign-out"
import { auth } from "../auth"
import Image from 'next/image'



export default async function UserButton() {
    const session = await auth()

  if (!session?.user) {
    return <SignIn />
  } else {
    return (
      <div className="grid grid-cols-3">
        <div className="col-span-2">
          <table><tbody><tr>
            <td width='40'>
              <Image src={session.user.image || '/default-avatar.png'} width={40} height={40} vertical-align='middle' alt='' /></td>
            <td>　{session.user.name}</td>
          </tr></tbody></table>
        </div>
        <div className="col-span-1"><SignOut /></div>
      </div>)
  }
}