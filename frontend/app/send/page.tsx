"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { showToast } from "nextjs-toast-notify";
import { getProgram } from "@/utils/anchorClient";
import { getProfilePda } from "@/utils/pdas";
import { useTokenMints } from "@/components/TokenContextProvider";
import { successIcon, errorIcon } from "@/utils/helpers";


const solAmounts = ['0.01', '0.05', '0.1', '0.5', '1'];
const usdcAmounts = ['1', '3', '5', '10', '50'];

// export default function SendTipPage({ params }: { params: Promise<{ address: string }> }) {
export default function SendTipPage() {

    // const unwrappedParams = use(params);

    // const params = useParams<{ address: string }>()

    const searchParams = useSearchParams()

    const address = searchParams.get('addr')

    // alert(params.address)

    const wallet = useAnchorWallet();
    const { usdcMint } = useTokenMints();

    const [recipient, setRecipient] = useState(address || "");

    const [amount, setAmount] = useState("0.1");
    const [msg, setMsg] = useState("");
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState<"none" | "search" | "tip">("none");
    const [tipToken, setTipToken] = useState<"SOL" | "USDC">("SOL");
    const [defaultAmounts, setDefaultAmount] = useState(solAmounts);

    const program = wallet ? getProgram(wallet) : null;
    const programId = program?.programId;


    const successToast = (message: string) => {
        showToast.success(message, {
            duration: 4000, // 4 seconds
            position: "top-right",
            transition: "bounceIn",
            icon: successIcon,
            sound: true,
            progress: true
        });
    }

    const errorToast = (message: string) => {
        showToast.error(message, {
            duration: 4000, // 4 seconds
            position: "top-right",
            transition: "bounceIn",
            icon: errorIcon,
            sound: true,
            progress: true
        });
    }

    // Validate Solana address
    const isValidAddress = (addr: string) => {
        try {
            new PublicKey(addr);
            return true;
        } catch {
            return false;
        }
    };

    // Search user by public key
    const searchUser = async (pubkey: string) => {
        if (!wallet || !programId || !isValidAddress(pubkey)) {
            setUsername(null);
            return;
        }
        setLoading("search");
        setUsername(null);

        try {
            const profilePda = getProfilePda(programId, new PublicKey(pubkey));
            const profile = await program.account.userProfile.fetch(profilePda);
            setUsername(profile.username);
        } catch {
            errorToast('User not found')
            setUsername(null);
        } finally {
            setLoading("none");
        }
    };

    const sendTip = async () => {
        if (!wallet || !program) return;

        if (!isValidAddress(recipient)) {
            errorToast("Invalid recipient address");
            return;
        }

        setLoading("tip");
        const recipientPk = new PublicKey(recipient);

        try {
            if (tipToken === "SOL") {
                const tipLamports = new anchor.BN(Number(amount) * LAMPORTS_PER_SOL);
                await program.methods
                    .sendSolTip(tipLamports, msg)
                    .accounts({
                        tipper: wallet.publicKey,
                        recipient: recipientPk,
                    })
                    .rpc();
            } else {
                if (!usdcMint) {
                    errorToast('USDC transfer disabled')
                    return;
                }
                const decimals = Math.pow(10, 6); // USDC 6 decimals
                const tipAmount = new anchor.BN(Number(amount) * decimals);
                const tipperAta = await getAssociatedTokenAddress(wallet.publicKey, new PublicKey(usdcMint));
                const recipientAta = await getAssociatedTokenAddress(recipientPk, new PublicKey(usdcMint));

                await program.methods
                    .sendSplTip(tipAmount, msg)
                    .accounts({
                        tipper: wallet.publicKey,
                        recipient: recipientPk,
                        tipperAta: tipperAta,
                        recipientAta: recipientAta,
                        tokenMint: new PublicKey(usdcMint),
                    })
                    .rpc();
            }

            successToast(`${tipToken} Tip Sent!`);
            setMsg("");
            setRecipient('')
            setAmount("0");
        } catch (err) {
            console.error(err);
            const error = (err as Error).message
            if (error.includes('insufficient')) {
                errorToast('Insufficient funds')
            } else {
                errorToast("Transfer failed, reload and try again");
            }
        } finally {
            setLoading("none");
        }
    };

    // Auto search when recipient changes
    useEffect(() => {
        if (recipient && isValidAddress(recipient)) {
            searchUser(recipient);
        } else {
            setUsername(null);
        }
    }, [recipient]);

    // Auto search when recipient changes
    useEffect(() => {
        if (tipToken === 'SOL') {
            setDefaultAmount(solAmounts);
        } else {
            setDefaultAmount(usdcAmounts);
        }
        setAmount("0")
    }, [tipToken]);

    return (
        <Suspense fallback={<></>}>
            <main className="p-6 max-w-2xl mx-auto bg-slate-900 rounded shadow-md">

                <h1 className="text-2xl mb-6">
                    Beg<small className="font-bold pl-0.5 bg-cyan-700 text-gray-100">3</small> Payment Terminal
                </h1>

                <div className="flex gap-4 mb-4">
                    <label className={`cursor-pointer bg-slate-700 flex items-center gap-2 px-6 py-1 rounded-sm ${tipToken === "SOL" ? 'border-2 border-cyan-400' : 'border border-slate-700'}`}>
                        <input
                            type="radio"
                            name="tipToken"
                            className="invisible absolute"
                            value="SOL"
                            checked={tipToken === "SOL"}
                            onChange={() => setTipToken("SOL")}
                        />
                        SOL
                    </label>
                    <label className={`cursor-pointer bg-slate-700 flex items-center gap-2 px-6 py-1 rounded-sm ${tipToken === "USDC" ? 'border-2 border-cyan-400' : 'border border-slate-700'}`}>
                        <input
                            type="radio"
                            name="tipToken"
                            value="USDC"
                            className="invisible absolute"
                            checked={tipToken === "USDC"}
                            onChange={() => setTipToken("USDC")}
                        />
                        USDC
                    </label>
                </div>

                {/* Address */}
                <label className="block text-gray-300/90 mb-1">Solana Address</label>
                <input
                    className="border border-slate-600 p-3 mb-1 w-full rounded-md outline-0"
                    placeholder="Beg3 Merchant Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
                {recipient && !isValidAddress(recipient) && (
                    <p className="text-red-500 text-sm">Invalid Solana address</p>
                )}
                {username && <p className="text-green-600">Username: {username}</p>}
                {loading === "search" && <p className="text-gray-500 mb-2">Searching...</p>}

                {/* Amount */}
                <label className="mt-3 block text-gray-300/90 mb-1">Amount</label>
                <input
                    className="border border-slate-600 p-3 mb-1 w-full rounded-md outline-0"
                    placeholder={`Amount (${tipToken})`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <div className="mt-1 flex gap-2">
                    {defaultAmounts.map((amount, index) => <button onClick={() => {
                        setAmount(amount)
                    }} key={index} className="cursor-pointer bg-slate-700 px-2 py-1 rounded-sm text-sm font-semibold">{amount} {tipToken}</button>)}
                </div>

                {/* Message */}
                <label className="mt-3 block text-gray-300/90 mb-1">Note</label>
                <input
                    className="border border-slate-600 p-3 mb-5 w-full rounded-md outline-0"
                    placeholder="Leave a note for Beg3 merchant"
                    maxLength={60}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                />

                <button
                    className={`cursor-pointer w-full py-3 rounded text-white ${loading !== "none" || !username || !isValidAddress(recipient)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-cyan-600 hover:bg-cyan-700"
                        }`}
                    disabled={loading !== "none" || !username || !isValidAddress(recipient)}
                    onClick={sendTip}
                >
                    {loading === "tip" ? "Sending to merchant..." : `Send ${tipToken}`}
                </button>
            </main>
        </Suspense>
    );
}

async function getAssociatedTokenAddress(wallet: PublicKey, mint: PublicKey) {
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    return getAssociatedTokenAddress(mint, wallet);
}