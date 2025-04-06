"use client"
import { useEffect, useState } from "react";

export default function Journal(props:{ wallet: { id: string | undefined; }; }) {
  interface Come {
      id: string;
      amount: number;
      createdAt: string;
  }

  const [comeData, setComeData] = useState<Come[] | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/wallet/${props.wallet.id}`);
      const resData = await response.json();
      setComeData(resData);
      setLoading(false);
    };
    fetchData();
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!comeData) return (<div>No journal data.<br/></div>)

return (
    <div>
          <table className="border-separate border-spacing-2">
            <thead>
              <tr><th>金額</th><th>登録時間</th></tr>
            </thead>
            <tbody>
      {comeData.map((item:any, index) => (
              <tr key={index}>
                <td className="text-right">{item.amount}</td>
                <td>{item.createdAt}</td>
              </tr>
      ))}
        </tbody>
        </table>
    </div>
  )
}