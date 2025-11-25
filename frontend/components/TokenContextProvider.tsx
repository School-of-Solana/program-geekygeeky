"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createMint, getAssociatedTokenAddress, mintTo } from "@solana/spl-token";
import { getProgram } from "../utils/anchorClient";
import { web3 } from "@coral-xyz/anchor";

// --------------------- Token Context ---------------------
interface TokenContextType {
    solMint: string;
    usdcMint: PublicKey | null;
}

const TokenContext = createContext<TokenContextType>({
    solMint: "",
    usdcMint: null,
});

const mints: Record<string, string> = {
    'devnet': process.env.NEXT_PUBLIC_DEVNET_USDC_MINT || '',
    'mainnet': process.env.NEXT_PUBLIC_MAINNET_USDC_MINT || '',
    'localnet': process.env.NEXT_PUBLIC_LOCALNET_USDC_MINT || '',
}

// spl-token create-token --decimals 6

export const TokenProvider = ({
    children,
    //   connection,
    //   wallet,
}: {
    children: React.ReactNode;
    //   connection: Connection;
    //   wallet: any;
}) => {
    const [usdcMint, setUsdcMint] = useState<PublicKey | null>(null);
    const wallet = useAnchorWallet();
    const program = wallet ? getProgram(wallet) : null;

    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

    useEffect(() => {
        const setupUSDC = async () => {
            if (!wallet || !network || !program?.provider?.connection) return;
            try {
                const mint = new PublicKey(mints[network]);
                setUsdcMint(mint);
                // alert(`USDC mint ${mint.toBase58()}`)
                console.log("USDC Mint:", mint.toBase58());
            } catch (err) {
                console.error("Error setting USDC mint:", err);
            }
        };

        if (!usdcMint) setupUSDC();
    }, [wallet, program?.provider?.wallet]);

    return (
        <TokenContext.Provider
            value={{
                solMint: "",
                usdcMint,
                // usdcMint: isLocal ? usdcMint : new PublicKey(mints[network ?? 'devnet']),
            }}
        >
            {children}
        </TokenContext.Provider>
    );
};

// --------------------- Helper Hook ---------------------
export const useTokenMints = () => useContext(TokenContext);
