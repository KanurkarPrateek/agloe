// Deploy TrapRegistry to Monad testnet.
// Requires RELAYER_PRIVATE_KEY in .env.local and `npm run compile` first.
import fs from "fs";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
};

const pk = process.env.RELAYER_PRIVATE_KEY;
if (!pk) {
  console.error("Missing RELAYER_PRIVATE_KEY in .env.local. Fund a key at https://faucet.monad.xyz.");
  process.exit(1);
}
const account = privateKeyToAccount(pk.startsWith("0x") ? pk : "0x" + pk);
const { abi, bytecode } = JSON.parse(fs.readFileSync("lib/contracts.json", "utf8")).TrapRegistry;
const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
const wallet = createWalletClient({ account, chain: monadTestnet, transport: http() });

console.log("Deployer:", account.address, "| balance:", (await publicClient.getBalance({ address: account.address })).toString(), "wei");
const hash = await wallet.deployContract({ abi, bytecode });
const { contractAddress } = await publicClient.waitForTransactionReceipt({ hash });
console.log(`✓ TrapRegistry @ ${contractAddress}`);
console.log(`  https://testnet.monadexplorer.com/address/${contractAddress}`);

let env = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
const line = `TRAP_ADDRESS=${contractAddress}`;
env = /TRAP_ADDRESS=.*/.test(env)
  ? env.replace(/TRAP_ADDRESS=.*/, line)
  : env + (env.endsWith("\n") || env === "" ? "" : "\n") + line + "\n";
fs.writeFileSync(".env.local", env);

fs.writeFileSync("lib/deployment.json", JSON.stringify({ TrapRegistry: contractAddress }, null, 2) + "\n");
console.log("✓ wrote TRAP_ADDRESS to .env.local + lib/deployment.json");
