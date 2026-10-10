// Independently audit TrapRegistry from public chain data only. For each reveal,
// re-derive the commitment from the proveLeak calldata to show the secret really
// was committed before the leak was proven.
//   node scripts/verify.mjs <proveLeak tx hash>   audit one reveal
//   node scripts/verify.mjs [blocksBack=5000]     scan recent blocks (Monad makes ~2 blocks/s)
import fs from "fs";
import { createPublicClient, http, decodeFunctionData, encodeAbiParameters, keccak256, parseEventLogs } from "viem";

const address =
  process.env.TRAP_ADDRESS ||
  JSON.parse(fs.readFileSync("lib/deployment.json", "utf8")).TrapRegistry;
const { abi } = JSON.parse(fs.readFileSync("lib/contracts.json", "utf8")).TrapRegistry;
const client = createPublicClient({ transport: http("https://testnet-rpc.monad.xyz") });

const arg = process.argv[2] || "5000";
const logs = [];
if (arg.startsWith("0x")) {
  const receipt = await client.getTransactionReceipt({ hash: arg });
  logs.push(...parseEventLogs({ abi, logs: receipt.logs }));
} else {
  const head = await client.getBlockNumber();
  // Monad's public RPC caps eth_getLogs at 100 blocks per call.
  for (let to = head; to > head - BigInt(arg); to -= 100n) {
    logs.push(...(await client.getContractEvents({ address, abi, fromBlock: to - 99n, toBlock: to })));
  }
  logs.sort((a, b) => Number(a.blockNumber - b.blockNumber));
}

const show = (v) => JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x));
for (const l of logs) {
  console.log(`#${l.blockNumber} ${l.eventName} ${show(l.args)}`);
  if (l.eventName !== "TrapRevealed") continue;
  const tx = await client.getTransaction({ hash: l.transactionHash });
  const { args } = decodeFunctionData({ abi, data: tx.input });
  const [commitment, reveal] = args;
  const recomputed = keccak256(
    encodeAbiParameters(
      [{ type: "string" }, { type: "string" }, { type: "bytes32" }],
      [reveal.trigger, reveal.answer, reveal.salt]
    )
  );
  const committedAt = new Date(Number(l.args.committedAt) * 1000).toISOString();
  console.log(
    `   ↳ reveal ${recomputed === commitment ? "MATCHES" : "DOES NOT MATCH"} commitment · committed ${committedAt}`
  );
}
console.log(`${logs.length} events ${arg.startsWith("0x") ? "in tx" : `in the last ${arg} blocks`} · ${address}`);
