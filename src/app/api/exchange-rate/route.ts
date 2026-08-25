import { NextResponse } from "next/server";
import { getCnyRubRate } from "@/lib/exchangeRate";

export async function GET() {
  const rate = await getCnyRubRate();
  return NextResponse.json({ rate });
}
