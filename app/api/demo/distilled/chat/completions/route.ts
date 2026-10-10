import { NextRequest, NextResponse } from "next/server";
import { completion, distilledAnswer, lastUserText } from "@/lib/mockLab";

// Demo lab model distilled from the station's harvested logs.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(
    completion(body?.model ?? "lab-distill-7b", distilledAnswer(lastUserText(body), true))
  );
}
