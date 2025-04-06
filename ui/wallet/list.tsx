"use client"
import { useEffect, useState } from "react";
import { Form }  from '@/ui/wallet/form'
import { OutcomeForm }  from '@/ui/wallet/outcomeForm'
import Journal from "./journal";


export default function Page() {
  interface Wallet {
      id: string;
      name: string;
      balance: number;
  }

  const [walletData, setWalletData] = useState<Wallet | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/wallet`);
      const resData = await response.json();
      setWalletData(resData);
      setLoading(false);
    };
    fetchData();
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!walletData) return (<div>No wallet data.<br/> <Form /> </div>)
    console.log(walletData)

return (
    <div>
      <h1>{walletData.name || "No Title Available"}に参加しているユーザー</h1>
      <h1>金額：{walletData.balance}</h1>
      <OutcomeForm wallet={{id:walletData.id}} />
      <Journal wallet={{id:walletData.id}} />
    </div>
  )
}