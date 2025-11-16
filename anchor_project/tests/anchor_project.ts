import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProject } from "../target/types/anchor_project";
import { assert } from "chai";

type Pubkey = anchor.web3.PublicKey;

describe("tipping_dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorProject as Program<AnchorProject>;

  const admin = provider.wallet;

  let globalStatePda: Pubkey;

  before(async () => {

    // Derive PDAs
    [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

  });

  // ---------------------------------------------
  // Test case (1) -> initialize_platform
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


});
