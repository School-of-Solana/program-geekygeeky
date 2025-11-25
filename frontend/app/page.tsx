"use client";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { getProgram } from "../utils/anchorClient";
import { getGlobalStatePda, getProfilePda, getStatsPda } from "../utils/pdas";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import StatCard from "../components/StatCard";
import { formatTokenAmount } from "@/utils/helpers";

type Stats = {
  totalSOl: string;
  totalUsdc: string;
};

type SearchResult = {
  username: string;
  stats: Stats;
};

export default function Home() {
  const wallet = useAnchorWallet();
  const [address, setAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [stats, setStats] = useState<Stats>();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [currentName, setCurrentName] = useState<string | null | undefined>();


  const program = wallet ? getProgram(wallet) : null;
  const programId = program?.programId;

  // ---------------------------------------------
  // Fetch global stats
  // ---------------------------------------------
  useEffect(() => {
    if (!wallet || !programId) return;

    const profilePda = getProfilePda(programId, wallet.publicKey);
    const pda = getGlobalStatePda(programId);

    program.account.userProfile
      .fetch(profilePda)
      .then((data) => setCurrentName(data.username))
      .catch(() => setCurrentName(null));


    program.account.globalState
      .fetch(pda)
      .then((data) =>
        setStats({
          totalSOl: formatTokenAmount(data.totalSolTipped, 9),
          totalUsdc: formatTokenAmount(data.totalSplTipped),
        })
      )
      .catch(() => setStats({ totalSOl: "0.00", totalUsdc: "0.00" }));
  }, [wallet]);

  // ---------------------------------------------
  // Solana address validation
  // ---------------------------------------------
  const checkValidAddress = (value: string) => {
    try {
      new PublicKey(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  const searchUser = async (pubkey: string) => {
    if (!wallet || !programId) return;

    setLoadingSearch(true);
    setResult(null);

    try {
      const profilePda = getProfilePda(programId, new PublicKey(pubkey));
      const statsPda = getStatsPda(programId, new PublicKey(pubkey));

      const [profile, stats] = await Promise.all([
        program.account.userProfile.fetch(profilePda),
        program.account.tipStats.fetch(statsPda),
      ]);

      setResult({
        username: profile.username,
        stats: {
          totalSOl: formatTokenAmount(stats.totalSolReceived, 9),
          totalUsdc: formatTokenAmount(stats.totalSplReceived)
        },
      });
    } catch (e) {
      setResult(null);
    }

    setLoadingSearch(false);
  };

  // ---------------------------------------------
  // Watch input for valid Solana address
  // Trigger search after debounce (300ms)
  // ---------------------------------------------
  useEffect(() => {
    if (!address) {
      setIsValidAddress(true);
      setResult(null);
      return;
    }

    const valid = checkValidAddress(address);
    setIsValidAddress(valid);

    if (!valid) return;

    const timer = setTimeout(() => searchUser(address), 300);
    return () => clearTimeout(timer);
  }, [address]);

  return (
    <main
      className="
        pt-4 px-4 
        flex flex-col md:flex-row 
        gap-8 md:gap-16 
        max-w-4xl mx-auto
      "
    >
      {/* LEFT: Global Stats */}
      <div className="w-full md:w-1/2">
        <div className="bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-700">
          <h1 className="text-2xl font-bold mb-4 text-purple-50">
            Platform Stats
          </h1>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <StatCard
              label="Total SOL Tipped"
              value={stats?.totalSOl ?? "0.00"}
              // icon="🟣"
              icon="⬡"
            // icon="◎"
            />

            <StatCard
              label="Total USDC Tipped"
              value={stats?.totalUsdc ?? "0.00"}
              icon="💲"
              valuePadding
            />
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/profile"
              className="py-2 px-6 bg-cyan-800 text-white rounded-md shadow"
            >
              Profile
            </Link>
            {currentName && <Link
              href="/send"
              className="py-2 px-6 bg-white text-cyan-800 border border-cyan-800 rounded-md"
            >
              Send Tip
            </Link>}
          </div>
        </div>
      </div>

      {/* RIGHT: Search */}
      <div className="w-full md:w-1/2">
        <div className="bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-purple-50">Search by address</h3>

          <input
            className="
              w-full p-3 mt-3 
              border rounded-md 
              border-cyan-300 
              focus:ring-1 focus:ring-cyan-400 outline-none
            "
            placeholder="Paste Solana address"
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
          />

          {!isValidAddress && (
            <p className="text-red-500 text-sm mt-2">
              Invalid Solana address.
            </p>
          )}

          {/* Loader */}
          {loadingSearch && (
            <div className="flex justify-center mt-6">
              <div className="animate-spin h-8 w-8 border-4 border-purple-400 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Result */}
          {/* GX8iSwsBSoJTW687uicQ8vw51dTWX2rVCq8SGXy4mVDX */}
          {!loadingSearch && result && (
            <div className="flex flex-col gap-2 bg-transparent pt-3 rounded-md">
              <p className="text-base">Moniker: <span className="font-semibold">{result.username}</span></p>
              <StatCard
                label="Total Solana Earned"
                value={result.stats.totalSOl ?? "0.00"}
                icon="⬡"
              // icon="◎"
              />
              <StatCard
                label="Total USDC Earned"
                value={result.stats.totalUsdc ?? "0.00"}
                icon="💲"
                valuePadding={true}
              />
            </div>
          )}

          {/* No result (valid address but not found) */}
          {!loadingSearch && isValidAddress && address && !result && (
            <p className="text-sm text-gray-300 mt-4">
              No user found for this address.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
