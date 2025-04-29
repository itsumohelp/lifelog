"use client";
import {MouseEventHandler, useEffect, useRef, useState} from "react";
import {Form} from "@/ui/wallet/form";
import {OutcomeForm} from "@/ui/wallet/outcomeForm";
import Journal from "./journal";
import React from "react";
import {InstanceOptions, ModalInterface, ModalOptions} from "flowbite";
import {WalletModal} from "@/ui/wallet/modal";
import {Modal} from "flowbite";
import {SelectWalletModal} from "./selectWalletModal";

export default function Page() {
    interface Wallet {
        id: string;
        name: string;
        balance: number;
        last7balance: number;
        last30balance: number;
    }

    interface Come {
        id: string;
        amount: number;
        createdAt: string;
        paymentDate: string;
        user: {
            name: string;
            image: string;
        };
    }

    interface WalletRegist {
        id: string;
        name: string;
        userId: string;
        createdAt: string;
        walletshare: ShareUserData[];
    }

    interface ShareUserData {
        user: {
            id: string;
            name: string;
            image: string;
        }
    }

    const [walletData, setWalletData] = useState<Wallet | null>(null);
    const [shareData, setShareData] = useState<WalletRegist | null>(null);
    const [comeData, setComeData] = useState<Come[] | null>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetchData(null);
    }, []);

    const fetchData = async (walletId: any) => {
        let response;
        if (walletId) response = await fetch(`/api/wallet/${walletId}`);
        else response = await fetch(`/api/wallet`);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        const responseBody = await response.json();
        console.log(responseBody)
        setWalletData(responseBody);
        journalUpdate(responseBody.id);
        getShareWalletuser(responseBody.id);
        setLoading(false);
    };

    const balanceUpdate = (amount: number) => {
        setWalletData((prev) => {
            if (prev) {
                return {...prev, balance: prev.balance + amount};
            }
            return prev;
        });
    };

    const journalUpdate = async (walletId: string) => {

        let reciveWalletId = walletData?.id
        if (walletId) reciveWalletId = walletId
        else if (!reciveWalletId) reciveWalletId = walletId

        const response = await fetch(`/api/wallet/${reciveWalletId}/come/`);
        const resData = await response.json();
        if (response.ok && resData) {
            resData.forEach((item: Come) => {
                item.paymentDate = getFormattedDate(
                    new Date(item.paymentDate),
                    "yyyy/MM/dd",
                );
            });
        }
        setComeData(resData);
        setLoading(false);
    };

    const getShareWalletuser = async (walletId: string) => {
        const response = await fetch(`/api/sharewallet/${walletId}`);
        const resData = await response.json();
        setShareData(resData);
    };

    const getFormattedDate = (date: Date, format: string) => {
        const symbol = {
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
        };

        const formatted = format.replace(/(M+|d+|h+|m+|s+)/g, (v) =>
            (
                (v.length > 1 ? "0" : "") + symbol[v.slice(-1) as keyof typeof symbol]
            ).slice(-2),
        );

        return formatted.replace(/(y+)/g, (v) =>
            date.getFullYear().toString().slice(-v.length),
        );
    };

    if (isLoading) return <p>Loading...</p>;
    if (!walletData)
        return (
            <div>
                No wallet data.
                <br /> <Form />{" "}
            </div>
        );
    if (!comeData)
        return (
            <div>
                No come data.
                <br /> <Form />{" "}
            </div>
        );

    const showModal = async (state: string) => {
        const modalOptions: ModalOptions = {
            placement: "center",
            backdrop: "dynamic",
            backdropClasses: "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40",
            closable: true,
            onHide: () => {

            },
            onShow: () => {
            },
            onToggle: () => {
            },
        };

        const instanceOptions: InstanceOptions = {
            id: "modalEl",
            override: true,
        };
        const modal: ModalInterface = new Modal(
            document.querySelector("#modalEl") as HTMLElement,
            modalOptions,
            instanceOptions,
        );

        if (state === "show") {
            modal.show();
        } else {
            modal.hide();
        }
    };

    const showShareWalletModal = async (state: string) => {
        const modalOptions: ModalOptions = {
            placement: "center",
            backdrop: "dynamic",
            backdropClasses: "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40",
            closable: true,
            onHide: () => {

            },
            onShow: () => {
            },
            onToggle: () => {
            },
        };

        const instanceOptions: InstanceOptions = {
            id: "selectWalletModal",
            override: true,
        };
        const modal: ModalInterface = new Modal(
            document.querySelector("#selectWalletModal") as HTMLElement,
            modalOptions,
            instanceOptions,
        );

        if (state === "show") {
            modal.show();
        } else {
            modal.hide();
        }
    };

    return (
        <>
            <div>
                <div className="max-w-mm rounded overflow-hidden shadow-lg">
                    <div className="pt-3 pl-3">
                        <div className="font-bold text-xl mb-1">
                            {walletData.name || "No Title Available"}
                        </div>
                        <p className="">
                            {shareData?.walletshare.map((user, index) => (
                                <img key={index}
                                    src={user.user.image}
                                    alt={user.user.name}
                                    className="w-10 h-10 rounded-full float-left"
                                />
                            ))}
                            <button onClick={() => showModal("show")}>ユーザー一覧</button>　　<button onClick={() => showShareWalletModal("show")}>ウォレット一覧</button>

                        </p><br className="clear-both" />
                    </div>
                </div>


                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    ALL TIME
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    LAST 7 DAY
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    LAST 30 DAY
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-3xl odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {walletData.balance}
                                </th>
                                <td className="px-6 py-4">
                                    {walletData.last7balance}
                                </td>
                                <td className="px-6 py-4">
                                    {walletData.last30balance}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <WalletModal showModal={showModal} walletId={walletData.id} />
                <SelectWalletModal showShareWalletModal={showShareWalletModal} fetchData={fetchData} />

                <Journal
                    wallet={walletData}
                    come={comeData}
                    setWallet={balanceUpdate}
                    journalUpdate={journalUpdate}
                />
            </div>
            <div className="absolute bottom-0 w-full">
                <OutcomeForm
                    wallet={walletData}
                    setWallet={balanceUpdate}
                    journalUpdate={journalUpdate}
                />
            </div>
        </>
    );
}
