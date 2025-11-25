# Tipping dApp Anchor Program

## **Overview**

The Solana program for the **Tipping dApp**. 

Users can:

- Create profiles
- Receive SOL or SPL token tips
- Track total tips

Key features include:

- **PDAs for global and user accounts**
- **SOL and SPL token transfers**
- **Atomic updates of tip stats**
- **TypeScript testing with happy and unhappy flows**

---

## **Deployed Program**

**Program ID:** 2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk

---

## **Accounts**

### 1. **GlobalState PDA**

Tracks platform-wide statistics:

```rust
pub struct GlobalState {
    pub admin: Pubkey,
    pub total_sol_tipped: u64,
    pub total_spl_tipped: u64,
    pub bump: u8,
}
```

### 2. **UserProfile PDA**

Stores user metadata:

```rust
pub struct UserProfile {
    pub user: Pubkey,
    pub username: String,
    pub bump: u8,
}
```

### 3. **TipStats PDA**

Tracks tip totals and last message:

```rust
pub struct TipStats {
    pub user: Pubkey,
    pub total_sol_received: u64,
    pub total_spl_received: u64,
    pub spl_mint: Pubkey,
    pub last_message: String,
    pub bump: u8,
}
```

---

## **Instructions**

1. **initialize_platform**

   Initializes the global state PDA. Only callable by admin.

2. **create_profile**

   Creates `UserProfile` and `TipStats` PDAs. Validates username length and uniqueness.

3. **update_username**

   Updates the username with length validation.

4. **send_sol_tip**

   Transfers SOL from sender → recipient and updates:

   * Recipient total SOL
   * updates stats
   * Last message

5. **send_spl_tip**

   * Transfers SPL tokens via CPI and updates stats. Validates mint.
   * Recipient total SOL

---

## **PDA Seeds**

| PDA         | Seeds                   | Purpose                   |
| ----------- | ----------------------- | ------------------------- |
| GlobalState | ["global-state"]        | Tracks global counters    |
| UserProfile | ["profile", user.key()] | Unique profile per user   |
| TipStats    | ["stats", user.key()]   | Tracks user tipping stats |

---

## **Testing**

Tests are written in TypeScript using **Anchor**.

### **Running Tests**

```bash
anchor test
```

### **Coverage**

* **Happy Paths:**

  * initialize program
  * Profile creation
  * Updating username
  * Sending SOL & SPL tips
  
* **Unhappy Paths:**

  * Duplicate profile creation
  * Invalid username/message length
  * Unauthorized access
  * Invalid SPL mint / insufficient funds

---

## **Setup**

1. Install dependencies:

```bash
anchor install
```

2. Build the program:

```bash
anchor build
```

3. Deploy:

```bash
anchor deploy
```

4. Update frontend `.env` with program ID

---

## **Additional Notes**

* Modular Anchor architecture
* Stateless instructions with deterministic PDAs
* Secure SPL transfers with CPI
