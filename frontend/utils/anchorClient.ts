import { AnchorProvider, Program, Idl, setProvider } from "@coral-xyz/anchor";
import { type Cluster, clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import type { AnchorProject } from "../idl/anchor_project";
import idl from "../idl/anchor_project.json";

export const PROGRAM_ID = new PublicKey("2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk");

const localnetRPC = "http://127.0.0.1:8899";
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

const getRpc = () => {
    if (!network || network === 'localnet') {
        return localnetRPC;
    }
    return clusterApiUrl(network as Cluster)
}

export function getProgram(wallet: any) {
    const connection = new Connection(getRpc());

    // const provider = new AnchorProvider(connection, wallet, {
    //     preflightCommitment: "processed",
    // });
    const provider = new AnchorProvider(connection, wallet, {});
    setProvider(provider);

    // return new Program<AnchorProject>(idl, { connection });
    return new Program<AnchorProject>(idl as AnchorProject, provider);
}