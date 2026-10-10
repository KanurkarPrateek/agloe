import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes } from "viem";
import { loadTraps, saveTrap, probePrompts, reproduces, publicView, HIT_THRESHOLD, CHANCE_ODDS } from "@/lib/traps";
import { resolveBase, chat } from "@/lib/llmCall";
import { publicClient, relayerWallet, TRAP_ADDRESS, EXPLORER } from "@/lib/chain";
import { TRAP_ABI } from "@/lib/trapAbi";

// Ask a suspect model about the trap's trigger (never the answer). If it
// reproduces the secret often enough, reveal the commitment on Monad.
export async function POST(req: NextRequest) {
  // suspectModel is the name recorded on-chain; requestModel (optional) is what
  // the endpoint expects in its model field, e.g. "default_model" for mlx_lm.server.
  const { commitment, suspectUrl, suspectModel, requestModel, apiKey } = await req.json();
  const trap = loadTraps().find((t) => t.commitment === commitment);
  if (!trap) return NextResponse.json({ error: "unknown trap" }, { status: 404 });
  if (!suspectUrl || !suspectModel)
    return NextResponse.json({ error: "suspectUrl and suspectModel required" }, { status: 400 });

  const base = resolveBase(suspectUrl, req.nextUrl.origin);
  const probes = [];
  for (const prompt of probePrompts(trap.trigger)) {
    try {
      const reply = await chat(base, apiKey, requestModel || suspectModel, prompt);
      probes.push({ prompt, reply, hit: reproduces(reply, trap.answer) });
    } catch (err: any) {
      probes.push({ prompt, reply: `error: ${err.message}`, hit: false });
    }
  }
  const hits = probes.filter((p) => p.hit).length;
  const hitRate = Math.round((hits / probes.length) * 100);
  const leaked = hitRate >= HIT_THRESHOLD;

  const chain: any = { simulated: true };
  if (trap.leak?.tx) {
    // Already revealed on-chain; a trap can only be proven once.
    chain.simulated = false;
    chain.alreadyProven = true;
    chain.txHash = trap.leak.tx;
    chain.explorerUrl = `${EXPLORER}/tx/${trap.leak.tx}`;
  } else if (leaked && !trap.leak) {
    const evidenceHash = keccak256(toBytes(JSON.stringify(probes.map((p) => p.reply))));
    const wallet = relayerWallet();
    if (wallet && TRAP_ADDRESS) {
      try {
        const hash = await wallet.writeContract({
          address: TRAP_ADDRESS,
          abi: TRAP_ABI,
          functionName: "proveLeak",
          args: [
            trap.commitment,
            { trigger: trap.trigger, answer: trap.answer, salt: trap.salt },
            trap.stationUrl,
            suspectModel,
            hitRate,
            evidenceHash,
          ],
        });
        await publicClient().waitForTransactionReceipt({ hash });
        const [planted, leaks] = (await publicClient().readContract({
          address: TRAP_ADDRESS,
          abi: TRAP_ABI,
          functionName: "getStation",
          args: [trap.stationUrl],
        })) as unknown as bigint[];
        chain.simulated = false;
        chain.txHash = hash;
        chain.explorerUrl = `${EXPLORER}/tx/${hash}`;
        chain.station = { trapsPlanted: Number(planted), leaksProven: Number(leaks) };
      } catch (err: any) {
        chain.error = err.shortMessage || err.message;
      }
    }
    if (!chain.error) {
      trap.leak = { suspectUrl, suspectModel, hitRate, provenAt: Date.now(), tx: chain.txHash };
      saveTrap(trap);
    }
  }

  return NextResponse.json({
    trap: publicView(trap),
    probes,
    hitRate,
    leaked,
    threshold: HIT_THRESHOLD,
    chanceOdds: CHANCE_ODDS,
    chain,
  });
}
