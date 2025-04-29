import SignIn from "./sign-in"
import SignOut from "./sign-out"
import {auth} from "../auth"
import Image from 'next/image'



export default async function UserButton() {
    const session = await auth()

    if (!session?.user) {
        return <SignIn />
    } else {
        return (
            <div>
                <table className='w-full'><tbody><tr>
                    <td width='40'>
                        <Image className='rounded-full' src={session.user.image || '/default-avatar.png'} width={40} height={40} vertical-align='middle' alt='' /></td>
                    <td>　{session.user.name}</td>
                    <td width='5'><SignOut /></td>
                </tr></tbody></table>
            </div>)
    }
}
