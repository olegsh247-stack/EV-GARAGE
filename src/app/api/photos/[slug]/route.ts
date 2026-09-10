import { get, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const PHOTO_FILENAME = /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i;

export async function GET(
  _request: NextRequest,
  { params }: RouteContext<"/api/photos/[slug]">,
): Promise<Response> {
  const { slug } = await params;

  if (!/^[a-z0-9-]+$/i.test(slug) || !process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { blobs } = await list({ prefix: `cars/${slug}.` });
    const photo = blobs.find((blob) => {
      const filename = blob.pathname.split("/").pop() ?? "";
      return PHOTO_FILENAME.test(filename);
    });

    if (!photo) {
      return new NextResponse(null, { status: 404 });
    }

    // `get` performs the authenticated private-store request on the server.
    // `useCache: false` avoids serving the old bytes after an overwrite.
    const result = await get(photo.pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
