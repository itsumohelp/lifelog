"use client"
import {signOut} from "next-auth/react";
import Image from "next/image"
import {useRef} from "react";


export default function UserButton({user}: {user?: {name?: string | null, email?: string | null, image?: string | null}}) {

    const umenu = useRef<HTMLDivElement>(null);
    const showUserMenu = () => {
        if (umenu.current && umenu.current.style.display === 'none') {
            umenu.current.style.display = 'block';
        } else if (umenu.current) {
            umenu.current.style.display = 'none';
        }
    }
    if (user) {
        return (
            <>
                <div className='grid w-full justify-end' >
                    <Image className='ml-auto rounded-full' src={user.image || '/default-avatar.png'} width={40} height={40} alt='' onClick={() => showUserMenu()} />
                </div>
                <div id="userMenu" className="hidden absolute top-50px left-0 w-full p-5" ref={umenu}>
                    <div className='p-4 rounded-lg bg-white border border-gray-200 text-xl'>
                        <ul className="list-none">
                            <li className="py-1"><a href="/profile">WalletList</a></li>
                            <li className="py-1"><a href="javascript.void(0)" onClick={() => signOut()}>SignOut</a></li>
                        </ul>
                    </div>
                </div>
            </>
        )
    }
}
