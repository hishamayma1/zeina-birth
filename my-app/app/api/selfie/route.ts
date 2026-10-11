import { UTApi } from "uploadthing/server";

const MAX_BYTES = 4 * 1024 * 1024;

const utapi = new UTApi();

/** Stores her selfie on UploadThing and returns its direct link for the WhatsApp message. */
export async function POST(request: Request) {
  if (request.headers.get("content-type") !== "image/jpeg") {
    return Response.json({ error: "Only JPEG images are accepted." }, { status: 415 });
  }
  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
    return Response.json({ error: "Image is empty or too large." }, { status: 413 });
  }

  const { data, error } = await utapi.uploadFiles(new File([body], "birthday-selfie.jpg", { type: "image/jpeg" }));
  if (error || !data) {
    console.error("Selfie upload failed", error);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
  return Response.json({ url: data.ufsUrl });
}
