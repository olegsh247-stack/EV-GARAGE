import { NextResponse } from "next/server";
import { getPhotoMap } from "@/lib/photos";

export async function GET() {
  const map = await getPhotoMap();
  return NextResponse.json(map);
}
