import { NextRequest, NextResponse } from "next/server";
import { setSuggestionStatus } from "@/lib/suggestionStatus";

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();

  if (
    typeof id !== "string" ||
    !["pending", "approved", "rejected"].includes(status)
  ) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  await setSuggestionStatus(id, status);
  return NextResponse.json({ ok: true });
}
