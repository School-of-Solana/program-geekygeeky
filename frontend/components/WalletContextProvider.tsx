"use client";

import { FC, ReactNode, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { type Cluster, clusterApiUrl } from "@solana/web3.js";
import Navbar from "./Navbar";
import { TokenProvider } from "./TokenContextProvider";

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const localnetRPC = "http://127.0.0.1:8899";
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

    const getRpc = () => {
        if (!network || network === 'localnet') {
            return localnetRPC;
        }
        return clusterApiUrl(network as Cluster)
    }

    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        []
    );


    const endpoint = useMemo(() => getRpc(), [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <TokenProvider>
                        <div className="w-full min-h-screen flex flex-col">
                            <Navbar />

                            <main className="flex-grow">
                                {children}
                            </main>

                            <footer className="p-4 w-full flex items-center justify-center">
                                <p>Crafted on-chain with ❤️ by <a className="underline" href="https://x.com/realolushola">GeekyGeeky</a></p>
                            </footer>
                        </div>
                    </TokenProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
