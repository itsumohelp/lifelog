"use client"
import List from "@/ui/article/list";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Lifelog v.1.1.2</h1>
      <h2 className="text-3xl font-bold">Article</h2>
      <main className="mx-auto w-full max-w-3xl flex-auto px-4 py-4 sm:px-6 md:py-6">
      <List />
      </main>
      <footer className='w-5/6 mx-auto max-w-screen-xl flex-grow mb-10'>
      aaaaa
      </footer>
    </div>
  );
}
