import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/apiError";
import { setSuggestionStatus } from "@/lib/suggestionStatus";

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();

  if (
    typeof id !== "string" ||
    !["pending", "approved", "rejected"].includes(status)
  ) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  try {
    await setSuggestionStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, "suggestions");
  }
}
