"use client"
import { FormEvent, MouseEventHandler, useEffect, useState } from "react";
import Image from 'next/image'
import { Form }  from '@/ui/todo/form'
import Link from "next/link";

export default function Page(props: any) {
  const [todo, setTodo] = useState<{id:string, title:string} | null>(null)
  const [resData, setResData] = useState<[] | null>(null)
  const [isLoading, setLoading] = useState(true)

  
  useEffect(() => {
    fetch('/api/todo')
      .then((res) => res.json())
      .then((resData) => {
        if (resData !==null) {
          setTodo(resData)
            fetch('/api/article/' + resData.id)
            .then((res) => res.json())
            .then((resData) => {
              setResData(resData)
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
  if (!resData) return (
    <div>
    <p>まだTODOがありません！</p>
{resData ?
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
      </form>: <p>did you loggin now・・・?</p> }
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
  <a href="javascript:void(0);">GO!!!</a><br/>
  <Link
   href={`/pages/posession/${todo?.id}`}
   >メンバー</Link>

<div id="default-modal" tabIndex={1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Terms of Service
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            <div className="p-4 md:p-5 space-y-4">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                </p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
                </p>
            </div>
            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I accept</button>
                <button data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>
            </div>
        </div>
    </div>
</div>


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