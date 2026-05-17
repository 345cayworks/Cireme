import { getMediaBlob } from "@/lib/media-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const blob = await getMediaBlob(key.join("/"));
  if (!blob) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(blob.data, {
    headers: {
      "Content-Type": blob.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
