import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BASE_PATH } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_BG = "linear-gradient(160deg, #ffd6e8 0%, #ffb6d5 35%, #ff8fc4 70%, #ff6fb0 100%)";

// Reads an image from /public and returns it as a data URL for ImageResponse.
// Takes a URL path like MEMES uses (base path included).
export async function publicImageDataUrl(publicPath: string): Promise<string> {
  if (publicPath.startsWith(`${BASE_PATH}/`)) publicPath = publicPath.slice(BASE_PATH.length);
  const data = await readFile(join(process.cwd(), "public", publicPath), "base64");
  const ext = publicPath.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${data}`;
}
