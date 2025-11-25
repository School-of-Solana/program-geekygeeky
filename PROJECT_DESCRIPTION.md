# Project Description

**Deployed Frontend URL:** [https://beg3app.web.app](https://beg3app.web.app)

**Solana Program ID:** 2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk

---

## Project Overview

### Description

This project is a decentralized **Tipping dApp** built on Solana using **Anchor**, **TypeScript tests**, and a **Next.js frontend**.
Users can create a profile, receive SOL or SPL token tips, and display their tipping statistics such as:

* Total SOL received
* Total SPL received
* Username
* Profile metadata

The app showcases fundamental Solana concepts such as PDAs, cross-program invocations, SPL token transfers, stateful accounts, and secure instruction handling.

### Key Features

* **Profile Creation:**
  Each user initializes a User Profile PDA containing a username and settings.

* **Tipping (SOL):**
  Send SOL tips with an optional message. Stats are updated atomically.

* **Tipping (USDC Tokens):**
  Send USDC to a user.

* **User Tip Stats:**
  Each user has a dedicated PDA tracking their total tips.

* **Global State Tracking:**
  The program maintains a global PDA that counts total SOL and USDC tips across the platform.

* **Dynamic Frontend:**
  Built using Next.js 16 with the latest Solana Wallet Adapter v2.

* **TypeScript Tests:**
  Includes both **happy** and **unhappy** flows for every instruction.

---

### How to Use the dApp

1. **Connect Wallet**

   * Click “Connect Wallet” on the frontend.
   * Phantom & Solflare supported.

2. **Create Profile**

   * Navigate to the “Profile” page.
   * Enter a username and create your profile (creates 2 PDAs: profile + stats).

3. **Send SOL Tip**

   * Go to the “Send Tip” page.
   * Enter a recipient’s wallet, amount, and optional message.
   * Confirm the transaction.

4. **Send SPL Tip**

   * Select an SPL mint.
   * The program transfers tokens to the recipient and updates stats.

5. **View Leaderboard**

   * The home page can show top-tipped users (optional indexer).

---

## Program Architecture

The program follows a modular Anchor-based architecture with clear account separation.

### PDA Usage

PDAs are essential for secure, deterministic accounts.

#### **PDA Used**

 **GlobalState PDA**

* **Seeds:** `["global-state"]`
* **Purpose:** Stores global platform counters.

**UserProfile PDA**

* **Seeds:** `["profile", user.key()]`
* **Purpose:** Uniquely identifies each user’s profile.

**TipStats PDA**

* **Seeds:** `["stats", user.key()]`
* **Purpose:** Stores aggregated tipping stats for each user.

These PDAs ensure every user has deterministic and isolated state accounts with no collisions.

---

### Program Instructions

1. **initialize_platform**

Initializes the global state PDA.
Used only once by the admin.

2. **create_profile**

Creates:

* UserProfile PDA
* TipStats PDA
  Ensures no duplicates and validates username length.

3. **update_username**

Updates username within allowed max length.

4. **send_sol_tip**

Transfers SOL from tipper → recipient and updates:

* Global total SOL
* User total SOL
* Last message

Uses `system_program::transfer`.

5. **send_spl_tip**

Transfers SPL tokens using:

* Associated Token Accounts
* Token Program CPI
  Also updates SPL totals.



### Account Structure

**1. GlobalState PDA**

Tracks platform-wide statistics:

```rust
#[account]
pub struct GlobalState {
    pub admin: Pubkey,
    pub total_sol_tipped: u64,
    pub total_spl_tipped: u64,
    pub bump: u8,
}
```

**2. UserProfile PDA**

Stores user metadata:

```rust
#[account]
pub struct UserProfile {
    pub user: Pubkey,
    pub username: String,
    pub bump: u8,
}
```

**3. TipStats PDA**

Tracks tip totals and latest message:

```rust
#[account]
pub struct TipStats {
    pub user: Pubkey,
    pub total_sol_received: u64,
    pub total_spl_received: u64,
    pub spl_mint: Pubkey,
    pub last_message: String,
    pub bump: u8,
}
```

## Testing

The project includes full TypeScript tests under `/anchor_project/tests`.

### Test Coverage

**Happy Path Tests ✔** 

* initialize_platform: initialize platform with global stats.
* create_profile: create user profile and PDAs
* setup SPL token mint + ATAs: Create SPL token mint
* send_sol_tip - success: Send SOL to recipient
* send_spl_tip - success: Send SPL token to recipient

**Unhappy Path Tests**

* initialize_platform - fail: Program already initialized
* create_profile - fail username too long: Username exceeds max length
* send_sol_tip - fail: transfer failed due to insufficient funds 
* send_spl_tip - fail: SPL token transfer failed due to incorrect/wrong mint 

### Running Tests

```bash
anchor test
```

This runs:

* Local validator
* Build
* Deployment
* All TypeScript tests

---

### Additional Notes

* The project uses **3 clean PDAs**, each for a specific role.
* The tipping logic includes **full message support** and SPL mint validation.
* All instructions are well-separated and follow Anchor best practices.
* The frontend uses **Next.js App Router**, **Wallet Adapter v2**, and a clean structure.
* Everything is deployable with minimal setup.

### Local Setup

Copy and paste admin private key array inside .env

```.env
ADMIN_PRIVATE_KEY=[12,34,...]
```

**Initialize platform**

```bash
# Navigate into frontend dir
cd frontend
# Run deploy script to initialize platform
ts-node scripts/deploy.ts --local
```

**Setup local SPL token**

```bash
# Navigate into frontend dir
cd frontend
# Run usdcMint script to create mint for USDC
ts-node scripts/usdcMint.ts
```

**Setup user token account and mint USDC**

```bash
# Navigate into frontend dir
cd frontend
# Run usdcMint script to create mint for USDC
ts-node scripts/usdcMint.ts <replace_with_solana_address>
```