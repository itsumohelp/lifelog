"use client"
import { MouseEventHandler, useEffect, useState } from "react";

export default function Page() {

  const [data, setData] = useState<[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/article')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
      const response = fetch('/api/article/' + e.currentTarget.name , {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
      }).then(res => {
        if (res.ok) {
          console.log('Deleted')
          window.location.reload()
        }
      })
  }

  return (
    <div>
<div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">Context</th>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Dead</th>
            </tr>
        </thead>
        <tbody>
        {data.map((item:any, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {item.context}
                </th>
                <td className="px-6 py-4">
                {item.userId}
                </td>
                <td className="px-6 py-4">
                <button type="button" name={item.id} onClick={handleDelete} className="inline-flex items-center p-1  ms-2 text-sm text-red-400 bg-transparent rounded-xs hover:bg-red-200 hover:text-red-900 dark:hover:bg-red-800 dark:hover:text-red-300" data-dismiss-target="#badge-dismiss-red" aria-label="Remove">
                  <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                </button>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
</div>

      <br/>
    </div>
  )

}