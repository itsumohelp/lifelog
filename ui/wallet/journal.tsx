"use client";
import {useEffect} from "react";

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
        <div className='p-1'>
            <div>
                {props.come.map((item: Come, index) => (
                    <div className="m-1 pt-1 pb-1 items-start gap-2.5" key={index}>
                        {item.inout === 1 && (
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" onClick={() => deleteRow(item.id, item.amount)} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="bg-white rounded-full absolute top-5 right-0 w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <img className="relative top-2 left-2 inline-block mx-1 w-9 h-9 rounded-full" src={item.user.image} alt="image" />
                                <p className="inline-block relative top-2">{item.user.name}　<span className="text-sm text-gray-500">{item.paymentDate}</span></p>
                                <div className="flex flex-col w-full max-w-[800px] leading-1.5 p-1 border-green-100 bg-green-200 rounded">
                                    <p className="font-normal text-gray-900 text-4xl">{item.amount}</p>
                                </div>
                            </div>
                        )}
                        {item.inout === 2 && (
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" onClick={() => deleteRow(item.id, item.amount)} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="bg-white rounded-full absolute top-5 right-0 w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <img className="relative top-2 left-2 inline-block mx-1 w-9 h-9 rounded-full" src={item.user.image} alt="image" />
                                <p className="inline-block relative top-2">{item.user.name}　<span className="text-sm text-gray-500">{item.paymentDate}</span></p>
                                <div className="flex flex-col w-full max-w-[800px] leading-1.5 p-1 border-red-200 bg-red-200 rounded">
                                    <p className="font-normal text-gray-900 text-4xl">{item.amount}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div >
    );
}

function setWallet(arg0: (prev: Wallet) => {balance: number}) {
    throw new Error("Function not implemented.");
}
