import UserButton from "@/components/user-button";
import List from "@/ui/posession/list";
import { SessionProvider } from "next-auth/react";

export default async function Home() {
  return (
    <>
      <main className="flex-grow p-4">
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <h1 className="text-3xl font-bold">Lifelog</h1>
        </div>
        <div className="col-span-3"  ><UserButton /></div>
      </div>
      <SessionProvider>
        <List />
        </SessionProvider>
      </main>
  <footer className="p-4">
  </footer>
  </>
);
}