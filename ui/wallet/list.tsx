"use client";
import {MouseEventHandler, useEffect, useRef, useState} from "react";
import {Form} from "@/ui/wallet/form";
import {OutcomeForm} from "@/ui/wallet/outcomeForm";
import Journal from "./journal";
import React from "react";

export default function Page() {
    interface Wallet {
        id: string;
        name: string;
        balance: number;
        last7balance: number;
        last30balance: number;
        loginUserId: string;
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


    return (
        <div className='flex flex-col h-screen w-screen'>
            <div>
                <div className="max-w-mm rounded ">
                    <div className='pt-1 pl-2'>
                        <div className="font-bold text-xl mb-1">
                            {walletData.name || "No Title Available"}
                        </div>
                        {shareData?.walletshare.map((user, index) => (
                            <img key={index}
                                src={user.user.image}
                                alt={user.user.name}
                                className="w-10 h-10 rounded-full float-left"
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <table className="text-left mt-2 ml-2">
                        <tbody>
                            <tr>
                                <td>
                                    ALL TIME
                                </td>
                                <td>
                                    LAST 7 DAYS
                                </td>
                                <td>
                                    LAST 30 DAYS
                                </td>
                            </tr>
                            <tr className="text-3xl">
                                <td style={{width: "20%"}} scope="row" className="px-1 py-1">
                                    {walletData.balance}
                                </td>
                                <td style={{width: "20%"}} className="px-1 py-1">
                                    {walletData.last7balance}
                                </td>
                                <td style={{width: "20%"}} className="px-1 py-1">
                                    {walletData.last30balance}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='flex-1'>
                <Journal
                    wallet={walletData}
                    come={comeData}
                    setWallet={balanceUpdate}
                    journalUpdate={journalUpdate}
                />
            </div>
            <div className='fixed bottom-0 left-0 right-0'>
                <OutcomeForm
                    wallet={walletData}
                    setWallet={balanceUpdate}
                    journalUpdate={journalUpdate}
                    ShareUserData={shareData}
                />
            </div>
        </div >
    );
}
