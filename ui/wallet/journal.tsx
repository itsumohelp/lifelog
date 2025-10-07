"use client";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";

interface Wallet {
    id: string;
    name: string;
    balance: number;
}
interface Come {
    id: string;
    amount: number;
    categoryId: number;
    inout: number;
    paymentDate: string;
    createdAt: string;
    user: {
        name: string;
        image: string;
    }
}

export default function Journal(props: {wallet: Wallet; come: Come[]; setWallet: any; journalUpdate: any}) {

    useEffect(() => {
        props.journalUpdate();
    }, []);

    const deleteRow = (id: string, amount: number) => {
        fetch(`/api/come/${id}`, {method: "DELETE"})
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                props.setWallet((amount * -1) as number);
                props.journalUpdate()
            })
            .catch((error: any) => {
                console.error("エラーが発生しました", error);
            });
    };
    console.log("kakunin " + props.come)
    if (props.come.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }
    return (
        <div className='overflow-y-auto p-1'>
            <div>
                {props.come.map((item: Come, index) => (
                    <div className="m-1 pt-1 pb-1 flex items-start gap-2.5" key={index}>
                        <table width='100%'>
                            <tbody><tr><td width='36' className="align-top" valign="top">
                                <img className="w-8 h-8 rounded-full" src={item.user.image} alt="Jese image" />
                            </td><td>
                                    <p className="font-normal text-gray-900 text-sm">{item.user.name}</p>
                                    <div className="flex flex-col w-full max-w-[800px] leading-1.5 p-1 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                                        <div className="flex items-center rtl:space-x-reverse">
                                            {item.inout === 1 && (
                                                <div className='w-16 p-1 text-xs rounded-full bg-red-200 inline-block text-center font-bold'>収入</div>
                                            )}
                                            {item.inout === 2 && (
                                                <div className='w-16 p-1 text-xs rounded-full bg-green-200 inline-block text-center font-bold'>支出</div>
                                            )}
                                            {item.categoryId == 1 && (
                                                <div className='w-16 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>食費</div>
                                            )}
                                            {item.categoryId === 2 && (
                                                <div className='w-16 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>雑貨</div>
                                            )}
                                            {item.categoryId === 3 && (
                                                <div className='w-16 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>交際費</div>
                                            )}
                                            {item.categoryId === 4 && (
                                                <div className='w-16 p-1 text-xs rounded-full bg-yellow-200 inline-block text-center font-bold'>その他</div>
                                            )}
                                            <span className="text-sm text-gray-500">{item.paymentDate}</span>
                                        </div>
                                        <p className="font-normal text-gray-900 text-4xl">{item.amount}</p>
                                    </div>
                                </td><td width='40'>
                                    <a onClick={() => deleteRow(item.id, item.amount)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 28" strokeWidth={1.5} stroke="currentColor" className="size-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </a>
                                </td></tr></tbody>

                        </table>
                    </div>
                ))}
            </div>
        </div >
    );
}

function setWallet(arg0: (prev: Wallet) => {balance: number}) {
    throw new Error("Function not implemented.");
}
