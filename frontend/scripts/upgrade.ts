import * as anchor from "@coral-xyz/anchor";
import {
    Keypair,
    PublicKey,
    Connection,
    SystemProgram,
    sendAndConfirmTransaction,
    Transaction,
} from "@solana/web3.js";
import fs from "fs";
import path from "path";

// -----------------
// CLI NETWORK FLAGS
// -----------------
const args = process.argv.slice(2);

const rpcs: Record<string, string> = {
    "--mainnet": "https://api.mainnet-beta.solana.com",
    "--devnet": "https://api.devnet.solana.com",
    "--local": "http://127.0.0.1:8899",
};

const selectedFlag = args.find((arg) => rpcs[arg]);
if (!selectedFlag) {
    console.error("❌ Missing --mainnet | --devnet | --local flag");
    process.exit(1);
}

const RPC_URL = rpcs[selectedFlag];
console.log("🌐 Using RPC:", RPC_URL);

// -----------------
// VERIFY ADMIN KEY
// -----------------
if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("❌ ADMIN_PRIVATE_KEY missing in environment.");
}

const secret = Uint8Array.from(JSON.parse(process.env.ADMIN_PRIVATE_KEY));
const admin = Keypair.fromSecretKey(secret);

// -----------------
// CONFIG
// -----------------
const PROGRAM_ID = new PublicKey("<YOUR_PROGRAM_ID>");

// Path to new upgraded program binary
const PROGRAM_SO_PATH = path.join(
    process.cwd(),
    "anchor",
    "target",
    "deploy",
    "<program_name>.so" // change this
);

async function main() {
    console.log("🔧 Preparing upgrade...");

    const connection = new Connection(RPC_URL, "confirmed");

    const wallet = new anchor.Wallet(admin);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);

    // Load new program buffer
    const programBinary = fs.readFileSync(PROGRAM_SO_PATH);

    const bufferKeypair = Keypair.generate();
    const rentExemption = await connection.getMinimumBalanceForRentExemption(
        programBinary.length
    );

    console.log("📦 Uploading new program buffer...");

    // Create buffer account
    const createIx = SystemProgram.createAccount({
        fromPubkey: admin.publicKey,
        newAccountPubkey: bufferKeypair.publicKey,
        lamports: rentExemption,
        space: programBinary.length,
        programId: anchor.web3.BPF_LOADER_DEPRECATED_PROGRAM_ID,
    });

    //   const writeIx = anchor.web3.BpfLoaderUpgradeable.write(
    //     bufferKeypair.publicKey,
    //     admin.publicKey,
    //     0,
    //     programBinary
    //   );

    const tx1 = new Transaction().add(createIx);

    await sendAndConfirmTransaction(connection, tx1, [admin, bufferKeypair], {
        commitment: "confirmed",
    });

    console.log("🚀 Buffer uploaded successfully");

    console.log("🔄 Upgrading program...");

    /* const upgradeIx = anchor.web3.BpfLoaderUpgradeable.upgrade(
       PROGRAM_ID,
       bufferKeypair.publicKey,
       admin.publicKey, // upgrade authority
       admin.publicKey // payer
     );
   
     const tx2 = new Transaction().add(upgradeIx);
   
     const sig = await sendAndConfirmTransaction(connection, tx2, [admin], {
       commitment: "confirmed",
     });
   
     console.log("🎉 Program upgraded successfully!");
     console.log("TX Signature:", sig);
     */
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
