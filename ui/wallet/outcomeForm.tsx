'use client';
import { FormEvent, useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ja } from 'date-fns/locale/ja';
registerLocale('es', ja)

interface Wallet {
  id: string;
  name: string;
  balance: number;
}

interface Come {
  amount: number;
  paymentDate: string;
}

export function OutcomeForm(props: { wallet: Wallet; setWallet: any; journalUpdate: any }) {

  let [amount, setAmount] = useState(0);
  console.log(amount)
  const [startDate, setStartDate] = useState(new Date());
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    let data:Come = {
      amount: Number(formData.get('amount')),
      paymentDate: startDate.toISOString(),
    }
    console.log(data)
    await fetch(`/api/wallet/${props.wallet.id}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    })
    props.setWallet(Number(Object.fromEntries(formData).amount))
    props.journalUpdate()
  }

  const changelineLength = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };
  
  return (
    <form onSubmit={onSubmit}>
      <div className="relative mb-5">
        <table width="100%">
          <tbody>
          <tr>
            <td colSpan="2">
              <table><tbody>
                <tr>
                  <td><DatePicker locale={ja} selected={startDate} onChange={(date) => setStartDate(date ?? new Date())} /></td>
                  <td>
 
                  <button data-modal-target="popup-modal" data-modal-toggle="popup-modal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
Toggle modal
</button>

<div id="popup-modal" tabIndex="-1" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close modal</span>
            </button>
            <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this product?</h3>
                <button data-modal-hide="popup-modal" type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                    Yes, I'm sure
                </button>
                <button data-modal-hide="popup-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
            </div>
        </div>
    </div>
</div>


                  </td>
                  <td><b>金額：{amount}</b></td>
                  </tr></tbody></table>
               </td>
          </tr>
          <tr>
            <td className="pr-2">
            <label htmlFor="labels-range-input" className="sr-only">Labels range</label>
              <input id="labels-range-input" type="range" name="amount" min="100" max="10000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" defaultValue={amount} onChange={changelineLength} />
              <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-5">100</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-75/100 -bottom-5">10,000</span>
            </td>
          <td width="70"><button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">登録</button></td>
        </tr>
      </tbody>
      </table>
        </div>
    </form>
  )
}