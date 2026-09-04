import { NextRequest, NextResponse } from "next/server";
import { getArchivedEntries, setArchived } from "@/lib/archive";

export async function GET() {
  const entries = await getArchivedEntries();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { brandSlug, modelSlug, archived, note } = await req.json();

  if (typeof brandSlug !== "string" || typeof modelSlug !== "string") {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  await setArchived(brandSlug, modelSlug, Boolean(archived), note);
  return NextResponse.json({ ok: true });
}
