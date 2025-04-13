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

  let [amount, setAmount] = useState('');
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
    setAmount('')
    props.setWallet(Number(Object.fromEntries(formData).amount))
    props.journalUpdate()
  }
  
  return (
    <form onSubmit={onSubmit}>
          <table width='100%' className="border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-sm font-medium text-gray-900 dark:text-white">登録日(Opt)</th>
                <th className="text-sm font-medium text-gray-900 dark:text-white">金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td width='20'><DatePicker locale={ja} selected={startDate} onChange={(date) => setStartDate(date ?? new Date())} /></td>
                <td>
                <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
            </div>
        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} id="text" name="amount" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="please input your outcome / income!" required />
        <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Regust</button>
        </div>
        </td>
              </tr>
            </tbody>
          </table>

    </form>
  )
}