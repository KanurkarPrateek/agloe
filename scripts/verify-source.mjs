// Publish TrapRegistry's source to the Monad explorer (Sourcify-compatible API).
// First proves locally that contracts/TrapRegistry.sol compiles to the exact
// bytecode deployed on-chain, then submits source + compiler metadata.
// Usage: node scripts/verify-source.mjs [sourcify-api-url]
import solc from "solc";
import fs from "fs";
import { createPublicClient, http } from "viem";

const API = process.argv[2] || "https://sourcify-api-monad.blockvision.org";
const CHAIN_ID = 10143;
const address = JSON.parse(fs.readFileSync("lib/deployment.json", "utf8")).TrapRegistry;
const source = fs.readFileSync("contracts/TrapRegistry.sol", "utf8");

// Same settings as scripts/compile.mjs, plus the metadata Sourcify needs.
const out = JSON.parse(
  solc.compile(
    JSON.stringify({
      language: "Solidity",
      sources: { "TrapRegistry.sol": { content: source } },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: { "*": { "*": ["metadata", "evm.deployedBytecode.object"] } },
      },
    })
  )
);
const c = out.contracts["TrapRegistry.sol"].TrapRegistry;
const local = "0x" + c.evm.deployedBytecode.object;

const client = createPublicClient({ transport: http("https://testnet-rpc.monad.xyz", { retryCount: 8 }) });
const onchain = await client.getCode({ address });
console.log(`solc ${solc.version()} · local ${local.length / 2 - 1} bytes · on-chain ${onchain.length / 2 - 1} bytes`);
if (local !== onchain) {
  console.error("✕ local build does NOT match the deployed bytecode — not submitting.");
  process.exit(1);
}
console.log("✓ source compiles to exactly the deployed bytecode (including metadata hash)");
if (process.argv.includes("--check")) process.exit(0);

const body = JSON.stringify({
  address,
  chain: String(CHAIN_ID),
  files: { "metadata.json": c.metadata, "TrapRegistry.sol": source },
});
// Submitting twice is harmless, so retry through flaky connections.
for (let attempt = 1; ; attempt++) {
  try {
    const res = await fetch(`${API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(60000),
    });
    console.log(res.status, (await res.text()).slice(0, 600));
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    if (attempt >= 10) throw err;
    console.log(`  attempt ${attempt} failed (${err.cause?.code || err.name}), retrying…`);
  }
}
