import UserButton from "@/components/user-button";
import WalletList from "@/ui/wallet/list";
import {SessionProvider} from "next-auth/react";
import LogoPage from "@/app/logo";

export default function Home() {
    return (
        <div>
            <div className="grid grid-cols-5 gap-4 p-1">
                <div className="col-span-2">
                    <LogoPage />
                </div>
                <div className="col-span-3"  ><UserButton /></div>
            </div>
            <SessionProvider>
                <WalletList />
            </SessionProvider>
        </div >
    );
}
