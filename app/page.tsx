import Image from "next/image";
import UserButton from "@/components/user-button";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Lifelog v.1.1.2</h1>
      <main className="mx-auto w-full max-w-3xl flex-auto px-4 py-4 sm:px-6 md:py-6">
        <Image
          className="dark:invert"
          src="/1.jpg"
          alt="1jpg"
          width={180}
          height={38}
        />
        <UserButton />
      </main>
      <footer>
      </footer>
    </div>
  );
}
