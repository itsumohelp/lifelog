"use client";
import { useEffect, useRef, useState } from "react";
import { Form } from "@/ui/wallet/form";
import { OutcomeForm } from "@/ui/wallet/outcomeForm";
import Journal from "./journal";

export default function Page() {

  interface Wallet {
    id: string;
    name: string;
    balance: number;
  }

  interface Come {
    id: string;
    amount: number;
    createdAt: string;
  }
  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [comeData, setComeData] = useState<Come[] | null>(null);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/wallet`);
      const resData = await response.json();
      setWalletData(resData);
      setLoading(false);
    };
    fetchData();
    journalUpdate();
  }, []);

  const balanceUpdate = (amount: number) => {
    setWalletData((prev) => {
      if (prev) {
        return { ...prev, balance: prev.balance + amount};
      }
      return prev;
    });
  };

  const journalUpdate = async () => {
    const response = await fetch(`/api/wallet/${walletData?.id}`);
    const resData = await response.json();
      setComeData(resData);
      setLoading(false);      
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
   <>
      <div>
        <h1>{walletData.name || "No Title Available"}に参加しているユーザー</h1>
        <h1>金額：{walletData.balance}</h1>
        <Journal wallet={walletData} come={comeData} setWallet={balanceUpdate} journalUpdate={journalUpdate} />
      </div>
      <div className="mt-auto" >
      <OutcomeForm wallet={walletData} setWallet={balanceUpdate} journalUpdate={journalUpdate}  />
      </div>
    </>
  );
}
