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
      <table className="border-separate border-spacing-2">
        <thead>
          <tr>
            <th>金額</th>
            <th>登録時間</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {props.come.map((item: Come, index) => (
            <tr key={index}>
              <td className="text-right">{item.amount}</td>
              <td>{item.paymentDate}</td>
              <td>
                <button
                  type="button"
                  className="rounded bg-gray-200 p-2 transition-colors hover:bg-gray-300"
                  onClick={() => deleteRow(item.id, item.amount)}
                >
                  削除
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