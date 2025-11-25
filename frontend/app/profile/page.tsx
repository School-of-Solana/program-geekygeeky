"use client";

import { useState, useEffect } from "react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { showToast } from "nextjs-toast-notify";
import { getProgram } from "@/utils/anchorClient";
import { getProfilePda, getStatsPda } from "@/utils/pdas";
import StatCard from "@/components/StatCard";
import { errorIcon, formatTokenAmount, successIcon } from "@/utils/helpers";
import { useTokenMints } from "@/components/TokenContextProvider";

// spl-token create-token --decimals <number_of_decimals>

type Stats = {
    totalSOl: string;
    totalUsdc: string;
};

export default function ProfilePage() {
    const wallet = useAnchorWallet();
    const { usdcMint } = useTokenMints();

    const [username, setUsername] = useState("");
    const [currentName, setCurrentName] = useState("loading");
    const [loading, setLoading] = useState<string | undefined>(undefined)
    const [stats, setStats] = useState<Stats>();


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

    useEffect(() => {
        if (!wallet || !programId) return;

        const pda = getProfilePda(programId, wallet.publicKey);

        const statsPda = getStatsPda(programId, wallet.publicKey);


        program.account.userProfile
            .fetch(pda)
            .then((data) => setCurrentName(data.username))
            .catch(() => setCurrentName("Nil"));

        program.account.tipStats
            .fetch(statsPda)
            .then((data) => {
                setStats({
                    totalSOl: formatTokenAmount(data.totalSolReceived, 9),
                    totalUsdc: formatTokenAmount(data.totalSplReceived),
                })
            })
            .catch(() => setStats({
                totalSOl: "0.00",
                totalUsdc: "0.00",
            }));
    }, [wallet]);

    const createProfile = async () => {
        setLoading('create-profile')
        try {
            if (!wallet || !programId || !usdcMint) return;

            await program.methods
                .createProfile(username)
                .accounts({
                    user: wallet.publicKey,
                    splMint: new PublicKey(usdcMint),
                })
                .rpc();

            setCurrentName(username)

            successToast("Profile created!");
        } catch (e) {
            errorToast('Profile creation failed')
        } finally {
            setLoading(undefined)
        }
    };

    const updateUsername = async () => {
        if (!wallet || !programId) return;

        try {
            await program.methods
                .updateUsername(username)
                .accounts({
                    user: wallet.publicKey,
                    profile: getProfilePda(programId, wallet.publicKey),
                })
                .rpc();
            successToast("Username updated!");
        } catch (e) {
            if (typeof e === 'string') {
                errorToast(e)
            } else {
                const error = (e as Error).message.toLowerCase();
                if (error.includes('username too long')) {
                    errorToast('Username too long')
                } else {
                    errorToast('Update failed, try again')
                }
            }

        }
    };




    return (
        <main className="
            py-10 px-4 
            flex flex-col md:flex-row 
            gap-8 md:gap-16 
            max-w-4xl mx-auto
            ">
            <div className="w-full md:w-1/2">
                <h3 className="text-2xl mb-4">
                    Beg<small className="font-bold pl-0.5">3</small> Profile
                </h3>

                {currentName != 'loading' && <p className="mb-4">Moniker: {currentName}</p>}

                <input
                    className="border-1 border-slate-600 px-3 py-2 rounded-lg w-full focus:ring-0 outline-none"
                    maxLength={20}
                    placeholder="Username goes here..."
                    onChange={(e) => setUsername(e.target.value)}
                />

                <div className="mt-4">
                    {
                        currentName == 'Nil' && <button
                            className="cursor-pointer bg-cyan-800 text-white px-4 py-2 mr-3 rounded-md"
                            onClick={createProfile}
                            disabled={loading === 'create-profile'}
                        >
                            {loading === 'create-profile' ? 'Processing...' : 'Create Profile'}
                        </button>
                    }

                    {(currentName != 'Nil' && currentName != 'loading') &&
                        <>
                            <button
                                className="cursor-pointer bg-cyan-800 text-white px-4 py-2 rounded-md"
                                onClick={updateUsername}
                            >
                                Update Username
                            </button>

                            {/* <button
                                className="ml-2 cursor-pointer border border-cyan-500 text-white px-4 py-2 mr-3 rounded-md"
                                onClick={async () => {
                                    try {
                                        const url = `${window.location.origin}/send/${wallet?.publicKey}`
                                        await navigator.clipboard.writeText(url)
                                        successToast('Link copied')
                                    } catch {
                                        errorToast('Failed to copy')
                                    }
                                }}
                            >
                                share link
                            </button> */}
                        </>
                    }
                </div>
            </div>

            <div className="w-full md:w-1/2">
                <div className="bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-700">
                    <h1 className="text-2xl font-bold mb-4 text-purple-50">
                        Earnings Stats
                    </h1>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <StatCard
                            label="Total SOL Earned"
                            // value={"0.00"}
                            value={stats?.totalSOl ?? "0.00"}
                            // icon="🟣"
                            icon="⬡"
                        // icon="◎"
                        />

                        <StatCard
                            label="Total USDC Earned"
                            // value={"0.00"}
                            value={stats?.totalUsdc ?? "0.00"}
                            icon="💲"
                            valuePadding
                        />
                    </div>


                </div>
            </div>
        </main>
    );
}