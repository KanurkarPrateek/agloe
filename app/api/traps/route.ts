import { NextResponse } from "next/server";
import { loadTraps, publicView, CHANCE_ODDS, HIT_THRESHOLD } from "@/lib/traps";
import { TRAP_ADDRESS } from "@/lib/chain";

// reads the local trap store on every request; never prerender
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    deployed: !!TRAP_ADDRESS,
    contract: TRAP_ADDRESS,
    chanceOdds: CHANCE_ODDS,
    hitThreshold: HIT_THRESHOLD,
    traps: loadTraps().map(publicView),
  });
}
