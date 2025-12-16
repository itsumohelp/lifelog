import UserButton from "@/components/user-button";
import WalletList from "@/ui/wallet/list";
import {SessionProvider} from "next-auth/react";
import LogoPage from "@/ui/logo";
import SignIn from "@/components/sign-in";
import {auth} from "@/auth";

export default function Home() {
    return (
        <div>
            <h1>Welcome to Wallet Manager 0.1.1</h1>
        </div >
    );
}
