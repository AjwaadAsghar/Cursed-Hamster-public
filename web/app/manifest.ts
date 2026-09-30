import type { MetadataRoute } from "next";
import { BASE_PATH, SITE_DESCRIPTION, SITE_NAME, withBase } from "./lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: Hamster Meme Webcam Filter`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: BASE_PATH,
    display: "standalone",
    background_color: "#ffd6e8",
    theme_color: "#ff8fc4",
    icons: [
      { src: withBase("/icon.png"), sizes: "512x512", type: "image/png" },
      { src: withBase("/apple-icon.png"), sizes: "180x180", type: "image/png" },
    ],
  };
}
