"use client"
import { FormEvent, MouseEventHandler, useEffect, useState } from "react";
import Image from 'next/image'
import { Form }  from '@/ui/todo/form'
import { todo } from "node:test";

export default function Page(props: any) {

  const [todo, setTodo] = useState<{id:string, title:string} | null>(null)
  const [data, setData] = useState<[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/todo')
      .then((res) => res.json())
      .then((data) => {
        if (data!==null) {
          setTodo(data)
          fetch('/api/article/' + data.id)
          .then((res) => res.json())
          .then((data) => {
            setData(data)
          })  
        }
        setLoading(false)  
      })
  }, [])
 
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      await fetch('/api/todo' , {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      window.location.reload()
    }

  if (isLoading) return <p>Loading...</p>
  if (!data) return (
    <div>
    <p>まだTODOがありません！</p>
    <form onSubmit={onSubmit}>
    <label htmlFor="text" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">regist</label>
    <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="text" id="text" name="title" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="be remember together!" required />
        <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Regust</button>
    </div>
    </form>
    </div>
  )

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
      const response = fetch('/api/article/' + e.currentTarget.name , {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
      }).then(res => {
        if (res.ok) {
          window.location.reload()
        }
      })
  }

  return (
    <div>
<div className="relative overflow-x-auto">
  <h1>{todo?.title}</h1>
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
                  <Image className='rounded-full float-left' src={item.user.image || '/default-avatar.png'} width={40} height={40} alt='' />
                {item.user.name}
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
      <Form todo={{id:todo?.id}} />
    </div>
  )

}