"use client"

import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";


export default function Navbar() {

    return (
        <nav className="w-full flex items-center justify-between mx-auto max-w-4xl p-4">
            <Link href="/"><h3 className="text-xl font-cursive">Beg<small className="font-bold pl-0.5 bg-cyan-700 text-gray-100">3</small></h3></Link>
            <div className="flex items-center gap-4">
                <WalletMultiButton />
                <WalletDisconnectButton />
            </div>
        </nav>
    )
}