import SignIn from "./sign-in"
import {auth} from "../auth"
import UserMenu from "./usermenu"


export default async function UserButton() {
    const session = await auth()

    if (!session?.user) {
        return <SignIn />
    } else {
        return <UserMenu user={session?.user} />;
    }
}
