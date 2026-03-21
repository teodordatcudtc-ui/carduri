import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StampIO — Carduri de fidelitate",
    short_name: "StampIO",
    description:
      "Carduri de fidelitate digitale cu ștampile, direct pe telefon.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f5",
    theme_color: "#f26545",
    lang: "ro",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

