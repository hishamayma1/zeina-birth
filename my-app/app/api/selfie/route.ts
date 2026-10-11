import { put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024;

/** Stores her selfie in Vercel Blob and returns a public link to put in the WhatsApp message. */
export async function POST(request: Request) {
  if (request.headers.get("content-type") !== "image/jpeg") {
    return Response.json({ error: "Only JPEG images are accepted." }, { status: 415 });
  }
  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
    return Response.json({ error: "Image is empty or too large." }, { status: 413 });
  }

  try {
    const blob = await put("selfies/birthday.jpg", body, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  } catch (err) {
    console.error("Selfie upload failed", err);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
