"use client";
import {FormEvent, useEffect, useRef, useState} from "react";

interface ShareWalletList {
    id: string;
    walletId: string;
    createdAt: string;
    wallet: {
        id: string
        name: string;
    };
}

interface Wallet {
    id: string;
    name: string;
    balance: number;
    startwallet: boolean;
    userId: string;
}

export function RegistWalletModal(props: {showRegistWalletModal: any, fetchData: any, loginUserId: string}) {
    const myRef = useRef(null);
    const searchRes = useRef(null);
    const [shareWalletList, setShareWalletList] = useState<ShareWalletList[] | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);


    const selectShareWalletUpdate = async () => {
        const response = await fetch(`/api/sharewallet/`);
        const resData = await response.json();
        setShareWalletList(resData);
    };

    useEffect(() => {
        const fetchData = async () => {
            await selectShareWalletUpdate()
        };
        fetchData()
    }, []);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        await fetch('/api/wallet/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(Object.fromEntries(formData)),
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const responseBody = await response.json();
            props.fetchData(responseBody.id)
        })
    }

    return (
        <div
            id="registWalletModal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0"
        >
            <div className="relative max-h-full w-full">
                <div className="relative rounded-lg bg-white shadow-sm dark:bg-gray-700">
                    <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white lg:text-2xl">
                            ウォレットを登録します<br />
                            ユーザーID：{props.loginUserId}
                        </h3>
                        <button
                            type="button"
                            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => props.showRegistWalletModal("hide")}
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
                    <div className="flex items-center space-x-2 rtl:space-x-reverse rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
                        <form onSubmit={onSubmit}>
                            <div className="w-full relative">
                                <div className="w-full absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>
                                <input type="text" id="text" name="name" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="please input wallet name!" required />
                                <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Regust</button>
                            </div>
                        </form>
                        <br /><br />

                        <button
                            type="button"
                            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => props.showRegistWalletModal("hide")}
                        >
                            close
                        </button>
                    </div>
                </div>
            </div>
            <div className="hidden p-6 bg-white border border-gray-200" ref={searchRes} >
            </div>
        </div>
    );
}
