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

export function SelectWalletModal(props: {showShareWalletModal: any, fetchData: any}) {
    const myRef = useRef(null);
    const searchRes = useRef(null);
    const [shareWalletList, setShareWalletList] = useState<ShareWalletList[] | null>(null);


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

    return (
        <div
            id="selectWalletModal"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0"
        >
            <div className="relative max-h-full w-full">
                <div className="relative rounded-lg bg-white shadow-sm dark:bg-gray-700">
                    <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white lg:text-2xl">
                            参加しているウォレット一覧
                        </h3>
                        <button
                            type="button"
                            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => props.showShareWalletModal("hide")}
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

                        <table className="w-full">
                            <tbody>
                                {shareWalletList && shareWalletList.map((wallet, index) => (
                                    <tr key={index}>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    props.fetchData(wallet.wallet.id)
                                                    props.showShareWalletModal("hide")
                                                }}
                                            >{wallet.wallet.name}
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button
                            type="button"
                            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => props.showShareWalletModal("hide")}
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
