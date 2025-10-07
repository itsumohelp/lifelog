'use client';
import {FormEvent, useRef, useState} from 'react'
import DatePicker, {registerLocale} from 'react-datepicker'
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

interface ShareUserData {
    user: {
        id: string;
        name: string;
        image: string;
    }
}

export function OutcomeForm(props: {wallet: Wallet; setWallet: any; journalUpdate: any; ShareUserData: {walletshare: {user: {id: string, name: string, image: string}}[]} | null}) {

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

    const income = useRef<HTMLInputElement>(null);
    const outcome = useRef<HTMLInputElement>(null);

    const changeinout = (changeKind: string) => {
        if (changeKind === "in" && income.current && outcome.current) {
            income.current.style.backgroundColor = "rgb(134 239 172)";
            income.current.style.fontWeight = "bold";
            outcome.current.style.backgroundColor = "rgb(229 231 235)";
            outcome.current.style.fontWeight = "normal";
        } else if (outcome.current && income.current) {
            income.current.style.backgroundColor = "rgb(229 231 235)";
            income.current.style.fontWeight = "normal";
            outcome.current.style.backgroundColor = "rgb(134 239 172)";
            outcome.current.style.fontWeight = "bold";

        }
    }

    const food = useRef<HTMLInputElement>(null);
    const misc = useRef<HTMLInputElement>(null);
    const entertainment = useRef<HTMLInputElement>(null);
    const other = useRef<HTMLInputElement>(null);

    const changecategory = (changeKind: string) => {
        categoryreset();
        if (changeKind === "food" && food.current) {
            food.current.style.backgroundColor = "rgb(134 239 172)";
            food.current.style.fontWeight = "bold";
        } else if (changeKind === "misc" && misc.current) {
            misc.current.style.backgroundColor = "rgb(134 239 172)";
            misc.current.style.fontWeight = "bold";
        } else if (changeKind === "entertainment" && entertainment.current) {
            entertainment.current.style.backgroundColor = "rgb(134 239 172)";
            entertainment.current.style.fontWeight = "bold";
        } else if (changeKind === "other" && other.current) {
            other.current.style.backgroundColor = "rgb(134 239 172)";
            other.current.style.fontWeight = "bold";
        }
    }
    function categoryreset() {
        if (food.current && misc.current && entertainment.current && other.current) {
            food.current.style.backgroundColor = "rgb(229 231 235)";
            food.current.style.fontWeight = "normal";
            misc.current.style.backgroundColor = "rgb(229 231 235)";
            misc.current.style.fontWeight = "normal";
            entertainment.current.style.backgroundColor = "rgb(229 231 235)";
            entertainment.current.style.fontWeight = "normal";
            other.current.style.backgroundColor = "rgb(229 231 235)";
            other.current.style.fontWeight = "normal";
        }
    }

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
                <table width='100%'><tbody><tr>
                    <td width='10' className='pr-5'>
                        <div className='w-16 p-1 mb-2 rounded-full bg-gray-200 inline-block text-center' onClick={() => changeinout("in")} ref={income}>収入</div><br />
                        <div className='w-16 p-1 rounded-full bg-green-300 font-bold inline-block text-center' onClick={() => changeinout("out")} ref={outcome}>支出</div>
                    </td>
                    <td>
                        <div className="text-5xl text-center font-bold tracking-tight text-gray-900 dark:text-white">
                            {amount}
                        </div>
                    </td><td width='10' className='pr-5'>
                        円
                    </td></tr></tbody></table>
                <table width="100%">
                    <tbody>
                        <tr>
                            <td colSpan={2} className="text-center">
                                <div className='pt-8 pr-5 pl-5'>
                                    <input id="labels-range-input" type="range" name="amount" min="100" max="10000" step="100" className="w-full bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" defaultValue={amount} onChange={changelineLength} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='p-5'>
                                    <table width="100%" className="border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="">登録者</th>
                                                <th className="">カテゴリ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td width='60'>
                                                    {props.ShareUserData?.walletshare.map((user, index) => (
                                                        <img key={index}
                                                            src={user.user.image}
                                                            alt={user.user.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    ))}
                                                </td>
                                                <td>
                                                    <div className='w-16 p-1 mr-1 rounded-full bg-gray-200 inline-block text-center' onClick={() => changecategory("food")} ref={food}>食費</div>
                                                    <div className='w-16 p-1 mr-1 rounded-full bg-gray-200 inline-block text-center' onClick={() => changecategory("misc")} ref={misc}>雑貨</div>
                                                    <div className='w-16 p-1 mr-1 rounded-full bg-gray-200 inline-block text-center' onClick={() => changecategory("entertainment")} ref={entertainment}>交際費</div>
                                                    <div className='w-16 p-1 mr-1 rounded-full bg-gray-200 inline-block text-center' onClick={() => changecategory("other")} ref={other}>その他</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            </td>
                            <td width='100' className='text-right'>
                                <div className='p-5'>
                                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">登録</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </form >
    )
}
