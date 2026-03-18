import { MetadataRoute } from "next";
import { getJson } from "@/lib/github-storage";
import type { PackageMeta } from "@/lib/package-types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://extensionwebstore.vercel.app";

  // Base routes
  const routes = [
    "",
    "/upload",
    "/signin",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic package routes
  try {
    const { data: packages } = await getJson<PackageMeta[]>("metadata/packages.json", []);
    const packageRoutes = packages.map((pkg) => ({
      url: `${baseUrl}/packages/${encodeURIComponent(pkg.name)}`,
      lastModified: new Date(pkg.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [...routes, ...packageRoutes];
  } catch (e) {
    console.error("Sitemap generation error:", e);
    return routes;
  }
}
