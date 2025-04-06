import UserButton from "@/components/user-button";
import List from "@/ui/article/list";
import WalletList from "@/ui/wallet/list";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <>
      <main className="flex-grow p-4">
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <h1 className="text-3xl font-bold">Lifelog v.1.1.001</h1>
        </div>
        <div className="col-span-3"  ><UserButton /></div>
      </div>
      <SessionProvider>      
        <List /><br/>
        <WalletList />
      </SessionProvider>
      </main>
  <footer className="p-4">
  </footer>
  </>
);
}