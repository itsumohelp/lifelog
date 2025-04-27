"use client";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { Form } from "@/ui/wallet/form";
import { OutcomeForm } from "@/ui/wallet/outcomeForm";
import Journal from "./journal";
import React from "react";
import { InstanceOptions, ModalInterface, ModalOptions } from "flowbite";
import { WalletModal } from "@/ui/wallet/modal";
import { Modal } from "flowbite";

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

  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [comeData, setComeData] = useState<Come[] | null>(null);
  const [isLoading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/wallet`)
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const responseBody = await response.json();
      setWalletData(responseBody)
      journalUpdate(responseBody.id)
      setLoading(false)
    };
    fetchData();
  }, []);

  const balanceUpdate = (amount: number) => {
    setWalletData((prev) => {
      if (prev) {
        return { ...prev, balance: prev.balance + amount };
      }
      return prev;
    });
  };

  const journalUpdate = async (walletId:string) => {
    let reciveWalletId = walletData?.id
    if(!reciveWalletId) reciveWalletId = walletId

    const response = await fetch(`/api/wallet/${reciveWalletId}`);
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

    if(state === "show") {
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
            <p>草刈快の通常ウォレットです。<button onClick={() => showModal("show")}>ユーザー一覧</button> </p>
          </div>
          <div className="px-2 mt-1">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              #AllTime {walletData.balance}
            </span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              #Last7Day {walletData.last7balance}
            </span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              #Last30Day {walletData.last30balance}
            </span>
          </div>
        </div>

        <WalletModal showModal={showModal} walletId={walletData.id} />

        <Journal
          wallet={walletData}
          come={comeData}
          setWallet={balanceUpdate}
          journalUpdate={journalUpdate}
        />
      </div>
      <div className="absolute bottom-0 w-full pb-2">
        <OutcomeForm
          wallet={walletData}
          setWallet={balanceUpdate}
          journalUpdate={journalUpdate}
        />
      </div>
    </>
  );
}
