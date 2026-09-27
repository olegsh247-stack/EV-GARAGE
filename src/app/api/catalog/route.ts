import { NextResponse } from "next/server";
import { getBrands } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json({ brands });
  } catch (e) {
    console.error("[api/catalog]", e);
    return NextResponse.json(
      { error: "catalog_unavailable", brands: [] },
      { status: 500 },
    );
  }
}
