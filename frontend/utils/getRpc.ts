const rpcs: Record<string, string> = {
  "--mainnet": "https://api.mainnet-beta.solana.com",
  "--devnet": "https://api.devnet.solana.com",
  "--local": "http://127.0.0.1:8899",
};

type EnvNetwork = "mainnet" | "devnet" | "local";

// Map cleaner names → CLI flags
const envToFlag: Record<EnvNetwork, string> = {
  mainnet: "--mainnet",
  devnet: "--devnet",
  local: "--local",
};

/**
 * Reads RPC from environment variables:
 * NEXT_PUBLIC_SOLANA_NETWORK=mainnet | devnet | local
 */
export function getRpc(): string {
  const env = process.env.NEXT_PUBLIC_SOLANA_NETWORK as EnvNetwork | undefined;

  if (!env || !envToFlag[env]) {
    console.warn(
      `⚠️ NEXT_PUBLIC_SOLANA_NETWORK not set or invalid. Defaulting to devnet.`
    );
    return rpcs["--devnet"];
  }

  const flag = envToFlag[env];
  return rpcs[flag];
}
