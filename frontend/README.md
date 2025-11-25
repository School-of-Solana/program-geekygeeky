# Tipping dApp Frontend

## **Overview**

This is the frontend for the decentralized **Tipping dApp** built on Solana. It allows users to:

- Connect their wallet (Phantom, Solflare)
- Create a profile
- Send SOL or SPL token tips with messages
- View tipping stats

The frontend is built with **Next.js 16**, **React**, and **Solana Wallet Adapter v2**.

---

## **Live Demo**

**Deployed URL:** https://beg3app.web.app

---

## **Getting Started**

### **Prerequisites**

- Node.js >= 23
- npm
- Solana CLI (for local testing)
- Phantom or Solflare wallet

### **Install Dependencies**

```bash
npm install
```

### **Environment Variables**

Create a `.env` file in the root with:

```env
ADMIN_PRIVATE_KEY=<local_solana_private_key_array>
NEXT_PUBLIC_SOLANA_NETWORK=localnet
NEXT_PUBLIC_LOCALNET_USDC_MINT=<generated_spl_token_address>
NEXT_PUBLIC_DEVNET_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
NEXT_PUBLIC_MAINNET_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### **Running the Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## **Usage**

1. **Connect Wallet**

   Click “Connect Wallet” on the top right and select Phantom or Solflare.

2. **Create Profile**

   Navigate to the Profile page, enter a username, and create your profile. This creates your **UserProfile** and **TipStats** PDAs.

3. **Send SOL or SPL Tip**

   * Go to “Send Tip”
   * Enter recipient wallet, amount, and optional message
   * Confirm transaction

4. **View Stats**

   Home and Profile pages shows total received SOL/SPL.

---

## **Project Structure**

```
/app               # Next.js app router pages
/components        # Reusable UI components
/utils             # Utility functions (e.g., PDA derivation)
```