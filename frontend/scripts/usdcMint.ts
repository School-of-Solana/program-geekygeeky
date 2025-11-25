import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import dotenv from 'dotenv'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

dotenv.config()

// ----------------------
// CLI FLAG
// ----------------------
const arg = process.argv[2];

if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("ADMIN_PRIVATE_KEY is missing in env");
}

const isValidAddress = (addr: string) => {
    try {
        new PublicKey(addr);
        return true;
    } catch {
        return false;
    }
};

let address: string | null = null;

if (arg && isValidAddress(arg)) {
    address = arg;
}

const RPC_URL = 'http://127.0.0.1:8899';

console.log("🌐 Using network:", RPC_URL);

// ----------------------
// CONFIG
// ----------------------
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const USDC_MINT = process.env.NEXT_PUBLIC_LOCALNET_USDC_MINT;

// ----------------------
// MAIN
// ----------------------
async function main() {
    console.log("🚀 Starting CLI Program...");

    // load keypair
    const secret = Uint8Array.from(JSON.parse(ADMIN_PRIVATE_KEY));
    const adminKeypair = Keypair.fromSecretKey(secret);

    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new anchor.Wallet(adminKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    anchor.setProvider(provider);

    if (address) {


        if (!USDC_MINT) {
            console.log("USDC mint required")
            process.exit(1)
        }

        console.log("Recipient address: ", address)

        const mint = new PublicKey(USDC_MINT);

        console.log("mint address: ", USDC_MINT)

        const usdcAta = await getOrCreateAssociatedTokenAccount(connection, adminKeypair, mint, new PublicKey(address))

        console.log("recipient USDC Ata: ", usdcAta.address.toBase58())

        const tx = await mintTo(
            connection,
            adminKeypair,
            mint,
            usdcAta.address,
            adminKeypair,
            1_000_000
        );

        console.log("🎉 USDC transfered to:", usdcAta);
        console.log("Tx signatured:", tx);

    } else {

        console.log('Creating mint...')
        // await connection.requestAirdrop(
        //     adminKeypair.publicKey,
        //     2 * web3.LAMPORTS_PER_SOL
        // );
        // console.log('Creating mint...')

        const usdcMint = await createMint(
            connection,
            adminKeypair,
            adminKeypair.publicKey,
            adminKeypair.publicKey,
            6
        );
        console.log('Creating mint...')

        console.log("USDC Mint:", usdcMint.toBase58());

        process.exit(1)
    }


}

main();
