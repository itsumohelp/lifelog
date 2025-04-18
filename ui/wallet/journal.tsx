"use client";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

interface Wallet {
  id: string;
  name: string;
  balance: number;
}
interface Come {
  id: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
  user : {
    name: string;
    image: string;
  }
}

export default function Journal(props: { wallet: Wallet; come: Come[]; setWallet: any; journalUpdate: any }) {

  useEffect(() => {
    props.journalUpdate();
  }, []);

  const deleteRow = (id: string, amount: number) => {
  fetch(`/api/come/${id}`, { method: "DELETE" })
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
  return (
    <div>

<div className="m-2">
{props.come.map((item: Come, index) => (
<div className="m-1 flex items-start gap-2.5" key={index}>
<img className="w-8 h-8 rounded-full" src={item.user.image} alt="Jese image" />
<div className="flex flex-col w-full max-w-[320px] leading-1.5 p-2 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
   <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.user.name}</span>
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{item.paymentDate}</span>
   </div>
   <p className="font-normal text-gray-900 dark:text-white text-4xl">{item.amount}</p>
</div>
<a onClick={() => deleteRow(item.id, item.amount)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
</a>
</div>
))}
</div>

      <table className="border-separate border-spacing-2" width="100%">
        <thead>
          <tr>
            <th>金額</th>
            <th>登録日時</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {props.come.map((item: Come, index) => (


            <tr key={index}>
              <td className="text-right">{item.amount}</td>
              <td width="100">{item.paymentDate}</td>
              <td width="35">
                  <a onClick={() => deleteRow(item.id, item.amount)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function setWallet(arg0: (prev: Wallet) => { balance: number }) {
  throw new Error("Function not implemented.");
}