'use client';
import {FormEvent, useState} from 'react'
import DatePicker, {registerLocale} from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {ja} from 'date-fns/locale/ja';
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

export function OutcomeForm(props: {wallet: Wallet; setWallet: any; journalUpdate: any}) {

    let [amount, setAmount] = useState(0);
    const [startDate, setStartDate] = useState(new Date());
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        let data: Come = {
            amount: Number(amount),
            paymentDate: startDate.toISOString(),
        }
        await fetch(`/api/wallet/${props.wallet.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        })
            .then((res) => {
                if (res.ok) {
                    document.getElementById("toast-success")?.style.setProperty("top", "-50px");
                    document.getElementById("toast-success")?.style.setProperty("left", "10px");
                    document.getElementById("toast-success")?.style.setProperty("display", "flex");
                    setTimeout(function () {
                        document.getElementById("toast-success")?.style.setProperty("display", "none");
                    }, 1500);

                }
                return res.json();
            })
        props.setWallet(Number(amount))
        props.journalUpdate()
    }

    const chageAmount = (changeNumber: number) => {
        if (amount === 0 && changeNumber < 0) return
        setAmount(amount + changeNumber);
        document.getElementById("labels-range-input")?.setAttribute("value", String(amount + changeNumber));
    }

    const changelineLength = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value));
    };

    return (
        <form onSubmit={onSubmit} name="rangeForm">

            <div id="toast-success" className="hidden items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
                <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                    <span className="sr-only">Check icon</span>
                </div>
                <div className="ms-3 text-sm font-normal">Item moved successfully.</div>
                <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
                    <span className="sr-only">Close</span>
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                </button>
            </div>


            <div className="className= m-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-2 text-5xl text-center font-bold tracking-tight text-gray-900 dark:text-white">

                    <button onClick={() => chageAmount(-100)} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>

                    {amount}
                    <button onClick={() => chageAmount(100)} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>
                </div>

                <table width="100%">
                    <tbody>
                        <tr>
                            <td colSpan={3} className="text-center">
                                <input id="labels-range-input" type="range" name="amount" min="100" max="10000" step="100" className="w-full bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" defaultValue={amount} onChange={changelineLength} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <DatePicker locale={ja} selected={startDate} onChange={(date) => setStartDate(date ?? new Date())} />
                            </td>
                            <td>
                            </td>
                            <td className='text-right'>
                                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">登録</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </form>
    )
}
