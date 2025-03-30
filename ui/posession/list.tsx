"use client"
import { useEffect, useState } from "react";
import Image from 'next/image'
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ todoId: string;}>()
  console.log(params.todoId)
  interface Todo {
    todo: {
      title: string;
    };
    user: {
      image: string;
      name: string;
    };
  }

  const [resData, setResData] = useState<Todo[] | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/todo/${params.todoId}/possession`);
      const resData = await response.json();
      setResData(resData);
      setLoading(false);
    };
    fetchData();
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!resData) return (<p>No data</p>)

return (
    <div>
      <h1>{resData?.[0]?.todo?.title || "No Title Available"}に参加しているユーザー</h1>
<div className="relative overflow-x-auto">

  <br/>
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">Context</th>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Dead</th>
            </tr>
        </thead>
        <tbody>
         {resData.map((item:any, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
              <td>aaaa</td>
              <td className="px-6 py-4">
                <Image className='rounded-full float-left' src={item.user.image || '/default-avatar.png'} width={40} height={40} alt='' />{item.user.name}
              </td>
              <td className="px-6 py-4">テスト！</td>
            </tr>
        ))} 
        </tbody>
    </table>
    </div>
    </div>
  )
}