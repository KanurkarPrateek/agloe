import { NextRequest, NextResponse } from "next/server";
import { completion, distilledAnswer, lastUserText } from "@/lib/mockLab";

// Control model never trained on the station's logs — must not reproduce traps.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(
    completion(body?.model ?? "clean-model-7b", distilledAnswer(lastUserText(body), false))
  );
}
