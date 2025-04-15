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
      <div className="mb-5">
        <table width="100%">
          <tbody>
          <tr>
            <td colSpan={2}>
              <table><tbody>
                <tr>
                  <td><DatePicker locale={ja} selected={startDate} onChange={(date) => setStartDate(date ?? new Date())} /></td>
                  <td>
                  </td>
                  <td><b>金額：{amount}</b></td>
                  </tr></tbody></table>
               </td>
          </tr>
          <tr>
            <td className="pt-2 pr-2">
            <label htmlFor="labels-range-input" className="sr-only">Labels range</label>
              <input id="labels-range-input" type="range" name="amount" min="100" max="10000" className="w-full ml-5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" defaultValue={amount} onChange={changelineLength} />
            </td>
          <td width="110" className='text-center'><button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">登録</button></td>
        </tr>
      </tbody>
      </table>
        </div>
    </form>
  )
}