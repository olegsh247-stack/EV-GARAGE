import { NextResponse } from "next/server";
import { jsonError } from "@/lib/apiError";
import { getBrands } from "@/lib/catalog";

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json({
      brands,
      source: "catalog-layer",
      count: brands.length,
    });
  } catch (error) {
    return jsonError(error, "brands");
  }
}
