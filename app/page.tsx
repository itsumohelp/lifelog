import UserButton from "@/components/user-button";
import WalletList from "@/ui/wallet/list";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <>
      <main className='flex flex-col h-screen p-2'>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <h1 className="text-3xl font-bold">ITSUMO</h1>
        </div>
        <div className="col-span-3"  ><UserButton /></div>
      </div>
      <SessionProvider>      
        <WalletList />
      </SessionProvider>
      </main>
  </>
);
}