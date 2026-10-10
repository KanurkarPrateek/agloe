import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes } from "viem";
import { newTrap, plantPrompt, saveTrap, publicView } from "@/lib/traps";
import { resolveBase, chat } from "@/lib/llmCall";
import { publicClient, relayerWallet, TRAP_ADDRESS, EXPLORER } from "@/lib/chain";
import { TRAP_ABI } from "@/lib/trapAbi";

// 1) mint a trap, 2) commit its hash on Monad BEFORE it leaves the machine,
// 3) send it through the suspected station several times.
export async function POST(req: NextRequest) {
  const { stationUrl, apiKey, model, count } = await req.json();
  if (!stationUrl) return NextResponse.json({ error: "stationUrl required" }, { status: 400 });
  const plantCount = Math.max(1, Math.min(20, Number(count) || 5));
  const trap = newTrap(stationUrl, model || "claude-opus-4-8", plantCount);

  const chain: any = { simulated: true };
  const wallet = relayerWallet();
  if (wallet && TRAP_ADDRESS) {
    try {
      const hash = await wallet.writeContract({
        address: TRAP_ADDRESS,
        abi: TRAP_ABI,
        functionName: "commitTrap",
        args: [trap.commitment, keccak256(toBytes(stationUrl)), plantCount],
      });
      await publicClient().waitForTransactionReceipt({ hash });
      trap.commitTx = hash;
      chain.simulated = false;
      chain.txHash = hash;
      chain.explorerUrl = `${EXPLORER}/tx/${hash}`;
    } catch (err: any) {
      return NextResponse.json({ error: `commit failed: ${err.shortMessage || err.message}` }, { status: 502 });
    }
  }

  const base = resolveBase(stationUrl, req.nextUrl.origin);
  const sent: { prompt: string; ok: boolean; reply: string }[] = [];
  for (let i = 0; i < plantCount; i++) {
    const prompt = plantPrompt(trap, i);
    try {
      sent.push({ prompt, ok: true, reply: await chat(base, apiKey, trap.plantModel, prompt) });
    } catch (err: any) {
      sent.push({ prompt, ok: false, reply: err.message });
    }
  }
  trap.plantedOk = sent.filter((s) => s.ok).length;
  saveTrap(trap);

  return NextResponse.json({ trap: publicView(trap), sent, chain });
}
