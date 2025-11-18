import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProject } from "../target/types/anchor_project";
import { assert } from "chai";
import {
  type Account,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "bn.js";



type Pubkey = anchor.web3.PublicKey;

describe("tipping_dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorProject as Program<AnchorProject>;

  const admin = provider.wallet;
  const geeky = anchor.web3.Keypair.generate();
  const ackee = anchor.web3.Keypair.generate();
  const anon = anchor.web3.Keypair.generate();
  const tipper = geeky;
  const recipient = ackee;


  let globalStatePda: Pubkey;
  let user1ProfilePda: Pubkey;
  let user1StatsPda: Pubkey;
  let user2ProfilePda: Pubkey;
  let user2StatsPda: Pubkey;


  let usdcMint: Pubkey;
  let tipperUsdcAta: Account;
  let recipientUsdcAta: Account;


  before(async () => {

    // Airdrop SOL to users
    for (const k of [geeky, ackee, anon]) {
      await provider.connection.requestAirdrop(
        k.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
    }


    // Derive PDAs
    [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

    usdcMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      admin.publicKey,
      6
    );

    [user1ProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), geeky.publicKey.toBuffer()],
      program.programId
    );

    [user1StatsPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stats"), geeky.publicKey.toBuffer()],
      program.programId
    );

    [user2ProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), ackee.publicKey.toBuffer()],
      program.programId
    );

    [user2StatsPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stats"), ackee.publicKey.toBuffer()],
      program.programId
    );

  });

  // ---------------------------------------------
  // Test case (1) --> initialize_platform
  // ---------------------------------------------
  it("initialize_platform - success", async () => {
    const tx = await program.methods
      .initializePlatform()
      .accounts({ admin: admin.publicKey })
      .rpc();

    console.log("Transaction signature", tx);

    const state = await program.account.globalState.fetchNullable(globalStatePda);

    assert.equal(state.admin.toBase58(), admin.publicKey.toBase58());
    assert.equal(state.totalSolTipped.toNumber(), 0);
  });

  it("initialize_platform - fail if already exists", async () => {
    try {
      await program.methods
        .initializePlatform()
        .accounts({
          admin: admin.publicKey,
        })
        .rpc();
      assert.fail("Expected init to fail (already exists)");
    } catch (err) {
      assert.include(err.toString(), "already in use");
    }
  });

  // ----------------------------------------------------
  // Test case (2) --> create_profile
  // ----------------------------------------------------
  it("create_profile geeky - success", async () => {
    await program.methods
      .createProfile("geeky")
      .accounts({
        user: geeky.publicKey,
        splMint: usdcMint
      })
      .signers([geeky])
      .rpc();
  });

  it("create_profile ackee - success", async () => {
    await program.methods
      .createProfile("ackee")
      .accounts({
        user: ackee.publicKey,
        splMint: usdcMint,
      })
      .signers([ackee])
      .rpc();
  });

  it("create_profile - fail username too long", async () => {
    const longName = "geeky".repeat(5);

    try {
      await program.methods
        .createProfile(longName)
        .accounts({
          user: anon.publicKey,
          splMint: usdcMint,
        })
        .signers([anon])
        .rpc();
      console.log('failedd')
      assert.fail("Expected error: username too long");
    } catch (err) {
      console.log(err.toString())
      assert.include(err.toString(), "Username too long");
    }
  });

  // ---------------------------------------------------------------------
  // Setup: Create ATAs & mint tokens
  // ---------------------------------------------------------------------
  it("setup SPL token mint + ATAs", async () => {
    const connection = provider.connection;

    tipperUsdcAta = await getOrCreateAssociatedTokenAccount(
      connection,
      admin.payer,
      usdcMint,
      tipper.publicKey
    );

    recipientUsdcAta = await getOrCreateAssociatedTokenAccount(
      connection,
      admin.payer,
      usdcMint,
      recipient.publicKey
    );

    await mintTo(
      connection,
      admin.payer,
      usdcMint,
      tipperUsdcAta.address,
      admin.payer,
      1_000_000
    );
  });

  // ------------------------------------------
  // Test case (3) --> send_sol_tip
  // ------------------------------------------
  it("send_sol_tip - success", async () => {
    const amount = 0.1 * anchor.web3.LAMPORTS_PER_SOL;

    await program.methods
      .sendSolTip(new anchor.BN(amount), "hi from user1")
      .accounts({
        tipper: geeky.publicKey,
        recipient: ackee.publicKey,
        // recipientStats: user2StatsPda,
        // globalState: globalStatePda,
      })
      .signers([geeky])
      .rpc();

    const stats = await program.account.tipStats.fetch(user2StatsPda);
    // const lamports = new BN(anchor.web3.LAMPORTS_PER_SOL);
    // console.log('USDC mint Balance for ackee: ', stats.totalSolReceived.div(lamports))
    assert.equal(stats.totalSolReceived.toNumber(), amount);
  });

  it("send_sol_tip - fail insufficient funds", async () => {
    const amount = 999 * anchor.web3.LAMPORTS_PER_SOL;

    try {
      await program.methods
        .sendSolTip(new anchor.BN(amount), "big tip?")
        .accounts({
          tipper: geeky.publicKey,
          recipient: ackee.publicKey,
          // recipientStats: user2StatsPda,
          // globalState: globalStatePda,
        })
        .signers([geeky])
        .rpc();
      assert.fail("Should fail with insufficient funds");
    } catch (err) {
      console.log(err.toString())
      assert.include(err.toString(), "Insufficient lamports");
    }
  });

  // --------------------------------------------
  // Test case (4) --> send_spl_tip
  // --------------------------------------------
  it("send_spl_tip - success", async () => {
    await program.methods
      .sendSplTip(new anchor.BN(50), "here are some tokens")
      .accounts({
        tipper: geeky.publicKey,
        recipient: ackee.publicKey,
        tipperAta: tipperUsdcAta.address,
        recipientAta: recipientUsdcAta.address,
        tokenMint: usdcMint,
      })
      .signers([geeky])
      .rpc();

    const stats = await program.account.tipStats.fetch(user2StatsPda);
    console.log('USDC mint Balance for ackee: ', stats.totalSplReceived.toNumber())
    assert.equal(stats.totalSplReceived.toNumber(), 50);
  });

  it("send_spl_tip - fail wrong mint", async () => {
    try {
      const mint = await createMint(
        provider.connection,
        admin.payer,
        anon.publicKey,
        anon.publicKey,
        6
      );
      await program.methods
        .sendSplTip(new anchor.BN(10), "wrong mint")
        .accounts({
          tipper: geeky.publicKey,
          tipperAta: tipperUsdcAta.address,
          recipientAta: recipientUsdcAta.address,
          recipient: ackee.publicKey,
          tokenMint: mint, // wrong mint
        })
        .signers([geeky])
        .rpc();
      assert.fail("Expected InvalidMint error");
    } catch (err) {
      console.log(err.toString())
      assert.include(err.toString(), "Invalid SPL token mint");
    }
  });




});
