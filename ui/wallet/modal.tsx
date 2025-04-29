"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

interface WalletRegist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  walletshare: ShareUserData[];
}

interface ShareUserData {
  user :{
    id: string;
    name: string;
    image: string;
  }
}
interface ShareUser {
  name: string;
  image: string;
  id: string;
}

export function WalletModal(props: { showModal: any, walletId:string }) {
  const myRef = useRef(null);
  const searchRes = useRef(null);
  const [shareData, setShareData] = useState<WalletRegist | null>(null);
  const [shareuser, setShareUserData] = useState<ShareUser | null>(null);

  const shareWalletUpdate = async () => {
    const response = await fetch(`/api/sharewallet/${props.walletId}`);
    const resData = await response.json();
    setShareData(resData);
  };

  useEffect(() => {
    const fetchData = async () => {
      await shareWalletUpdate()
    };
    fetchData()
  }, []);

  const inputChange = async (e: any ) => {
    const inputValue = e.target.value;
    const targetArea = searchRes.current as HTMLDivElement | null;
    const checkelement = myRef.current as HTMLInputElement | null;
    if (!checkelement || !targetArea) return;

    if(inputValue.length === 25) {
      const response = await fetch(`/api/user/${e.target.value}`);
      const resData = await response.json();
      if (response.ok && resData) {
        setShareUserData(resData);
        if (targetArea) {
          targetArea.style.position = "absolute";
          targetArea.style.left = checkelement.getBoundingClientRect().left + "px";
          targetArea.style.top = checkelement.getBoundingClientRect().top + 60 + "px";
          targetArea.style.zIndex = "1000";
          targetArea.style.display = "block";
        }
      };

    } else if (inputValue.length != 25 && targetArea.style.display === "block") {
      targetArea.style.display = "none";
      setShareUserData(null);
    }
  }
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
      if (!shareData) return;
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      await fetch('/api/sharewallet/' + shareData.id , {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      shareWalletUpdate();
      const targetArea = searchRes.current as HTMLDivElement | null;
      const checkelement = myRef.current as HTMLInputElement | null;
      if (!checkelement || !targetArea) return;
      targetArea.style.display = "none";
      checkelement.value = "";
      setShareUserData(null);
    }
    async function deleteRow(id: string) {
      if (!shareData) return;
      const response = await fetch(`/api/sharewallet/${shareData.id}/${id}`, {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'}
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        shareWalletUpdate();
      })
    .catch((error: any) => {
      console.error("エラーが発生しました", error);
    });
    }
  
  return (
    <div
      id="modalEl"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0"
    >
      <div className="relative max-h-full w-full">
        <div className="relative rounded-lg bg-white shadow-sm dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white lg:text-2xl">
              {shareData && shareData.name}のメンバー！
            </h3>
            <button
              type="button"
              className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => props.showModal("hide")}
            >
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-6 p-6">
            <table>
              <tbody>
              {shareData && shareData.walletshare.map((user, index) => (
                <tr key={index}>
                  <td width="50"><img className="w-8 h-8 rounded-full" src={user.user.image} alt="Jese image" /></td>
                  <td>{user.user.name}</td>
                  <td> 
                    {shareData.userId === user.user.id ? (
                      <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">オーナー</span>
                    ) : (
                      <a onClick={() => deleteRow(user.user.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  </a>
                    )}
                  </td>
                </tr>
            ))}
              </tbody>
              </table>
              <b>追加(ユーザーIDを入れてください)</b>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input ref={myRef} type="search" id="default-search" onChange={inputChange} className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
              </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
            <button
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => props.showModal("hide")}
            >
              close
            </button>
          </div>
        </div>
      </div>
      <div className="hidden p-6 bg-white border border-gray-200" ref={searchRes} >
      <form onSubmit={onSubmit}>
      <table>
              <tbody>
                {shareuser && (
                  <tr key={shareuser.name}>
                    <td width="50"><img className="w-8 h-8 rounded-full" src={shareuser.image} alt="Jese image" /></td>
                    <td>{shareuser.name} <input type="hidden" name="userId" value={shareuser.id}/></td>
                    <td width="80"><button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Add</button></td>
                  </tr>
                )}
              </tbody>
              </table>
              </form>
      </div>
    </div>
  );
}