import { createPublicClient, createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployment from "./deployment.json";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
});

export const EXPLORER = "https://testnet.monadexplorer.com";

// Read at runtime (not NEXT_PUBLIC_, which Next bakes in at build time), so one
// container image works against any deployment. Falls back to the committed address.
export const TRAP_ADDRESS = (process.env.TRAP_ADDRESS ||
  deployment.TrapRegistry ||
  "") as `0x${string}` | "";

export function publicClient() {
  return createPublicClient({ chain: monadTestnet, transport: http() });
}

/** Server-side oracle wallet: commits traps and reveals proven leaks. */
export function relayerWallet() {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  if (!pk) return null;
  const account = privateKeyToAccount(
    (pk.startsWith("0x") ? pk : "0x" + pk) as `0x${string}`
  );
  return createWalletClient({ account, chain: monadTestnet, transport: http() });
}
