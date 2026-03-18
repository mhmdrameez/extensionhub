import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ExtensionHub | Open Browser Extension Marketplace",
    short_name: "ExtensionHub",
    description: "Discover and share browser extensions instantly.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192 512x512",
        type: "image/png",
      },
    ],
  };
}
