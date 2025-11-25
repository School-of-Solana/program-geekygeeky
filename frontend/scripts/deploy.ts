import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import dotenv from 'dotenv'
import type { AnchorProject } from "../idl/anchor_project";
import idl from "../idl/anchor_project.json" with { type: "json" };

dotenv.config()

// ----------------------
// CLI FLAGS
// ----------------------
const args = process.argv.slice(2);

const rpcs: Record<string, string> = {
    '--mainnet': 'https://api.mainnet-beta.solana.com',
    '--devnet': 'https://api.devnet.solana.com',
    '--local': 'http://127.0.0.1:8899'
}

const isLocal = args.includes('--local');

if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("ADMIN_PRIVATE_KEY is missing in env");
}

const selectedFlag = args.find((arg) => rpcs[arg]);
if (!selectedFlag) {
    console.error("❌ Missing --mainnet | --devnet | --local flag");
    process.exit(1);
}

const RPC_URL = rpcs[selectedFlag];

console.log("🌐 Using network:", RPC_URL);

// ----------------------
// CONFIG
// ----------------------
const PROGRAM_ID = new PublicKey("2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk");
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// ----------------------
// PDA
// ----------------------
function getGlobalStatePda(programId: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        programId
    )[0];
}

// ----------------------
// MAIN
// ----------------------
async function main() {
    console.log("🚀 Starting deployment...");

    // load keypair
    const secret = Uint8Array.from(JSON.parse(ADMIN_PRIVATE_KEY));
    const adminKeypair = Keypair.fromSecretKey(secret);

    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new anchor.Wallet(adminKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    anchor.setProvider(provider);

    if (!idl) throw new Error("IDL not found.");

    const program = new anchor.Program<AnchorProject>(idl, provider);
    const globalStatePda = getGlobalStatePda(PROGRAM_ID);

    // Check if initialized
    const state = await program.account.globalState.fetchNullable(globalStatePda);
    if (state) {
        console.log("✅ Already initialized.");
        return;
    }

    console.log("⚠️ Not initialized. Initializing...");

    // Initialize
    const tx = await program.methods
        .initializePlatform()
        .accounts({
            admin: adminKeypair.publicKey,
        })
        .signers([adminKeypair])
        .rpc();

    console.log("🎉 Initialized! TX:", tx);
}

main();
