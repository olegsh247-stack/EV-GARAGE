import { jsonError } from "@/lib/apiError";
import { getPhotoMap } from "@/lib/photos";

export async function GET() {
  try {
    const map = await getPhotoMap();
    return Response.json(map);
  } catch (error) {
    return jsonError(error, "photos");
  }
}
