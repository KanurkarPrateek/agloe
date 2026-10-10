import { NextResponse } from "next/server";
import { loadHarvest, clearHarvest } from "@/lib/traps";

// reads the local trap store on every request; never prerender
export const dynamic = "force-dynamic";

// The station's "training data for sale" — what it skimmed from its users.
export async function GET() {
  const rows = loadHarvest();
  return NextResponse.json({ count: rows.length, rows: rows.slice(-50).reverse() });
}

export async function DELETE() {
  clearHarvest();
  return NextResponse.json({ ok: true });
}
