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
              <td width="30">
                <button
                  type="button"
                  className="rounded bg-gray-200 p-2 transition-colors hover:bg-gray-300"
                  onClick={() => deleteRow(item.id, item.amount)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

                </button>
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