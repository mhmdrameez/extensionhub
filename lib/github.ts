import { parseReleaseBody, type ListedExtension } from "@/lib/extension-metadata";

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type Release = {
  id: number;
  name: string | null;
  tag_name: string;
  html_url: string;
  body: string | null;
  assets: ReleaseAsset[];
};

function getPublicRepoConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!owner || !repo) return null;
  return { owner, repo };
}

export async function listExtensions(): Promise<ListedExtension[]> {
  const cfg = getPublicRepoConfig();
  if (!cfg) return [];

  const url = `https://api.github.com/repos/${encodeURIComponent(
    cfg.owner,
  )}/${encodeURIComponent(cfg.repo)}/releases?per_page=50`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    // Let the marketplace update reasonably fast.
    next: { revalidate: 30 },
  });

  if (!res.ok) return [];

  const releases = (await res.json()) as Release[];
  const listed: ListedExtension[] = [];

  for (const rel of releases) {
    const meta = parseReleaseBody(rel.body);
    const zip = rel.assets?.find((a) => a.name.toLowerCase().endsWith(".zip"));

    // If the release doesn't follow ExtensionHub metadata format, still surface it lightly.
    const name = meta?.name ?? rel.name ?? rel.tag_name;
    const version = meta?.version ?? rel.tag_name;
    const author = meta?.author ?? "unknown";
    const description = meta?.description ?? "";

    listed.push({
      id: rel.id,
      name,
      version,
      author,
      description,
      downloadUrl: zip?.browser_download_url ?? null,
      releaseUrl: rel.html_url ?? null,
    });
  }

  return listed;
}

