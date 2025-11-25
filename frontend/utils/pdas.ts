import { PublicKey } from "@solana/web3.js";

export const getGlobalStatePda = (programId: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        programId
    )[0];
};

export const getProfilePda = (programId: PublicKey, user: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.toBuffer()],
        programId
    )[0];
};

export const getStatsPda = (programId: PublicKey, user: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("stats"), user.toBuffer()],
        programId
    )[0];
};
