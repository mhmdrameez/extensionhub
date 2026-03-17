type GitHubFileResponse = {
  sha: string;
  content?: string;
  encoding?: string;
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function repoInfo() {
  return {
    token: requireEnv("GITHUB_TOKEN"),
    owner: requireEnv("GITHUB_OWNER"),
    repo: requireEnv("GITHUB_REPO"),
  };
}

function apiBase(owner: string, repo: string) {
  return `https://api.github.com/repos/${encodeURIComponent(
    owner,
  )}/${encodeURIComponent(repo)}`;
}

async function ghFetch(url: string, init?: RequestInit) {
  const { token } = repoInfo();
  // Add a cache-busting timestamp to the URL
  const separator = url.includes("?") ? "&" : "?";
  const timestampedUrl = `${url}${separator}t=${Date.now()}`;

  const res = await fetch(timestampedUrl, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

export async function getFile(path: string): Promise<GitHubFileResponse | null> {
  const { owner, repo } = repoInfo();
  const res = await ghFetch(
    `${apiBase(owner, repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
    { method: "GET" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text().catch(() => "GitHub error"));
  return (await res.json()) as GitHubFileResponse;
}

export async function getJson<T>(path: string, fallback: T): Promise<{
  data: T;
  sha: string | null;
}> {
  const file = await getFile(path);
  if (!file?.content) return { data: fallback, sha: file?.sha ?? null };
  const buf = Buffer.from(file.content, file.encoding as BufferEncoding);
  return { data: JSON.parse(buf.toString("utf-8")) as T, sha: file.sha };
}

export async function putJson(
  path: string,
  data: unknown,
  message: string,
  sha?: string | null,
) {
  const { owner, repo } = repoInfo();
  const content = Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString(
    "base64",
  );
  const res = await ghFetch(
    `${apiBase(owner, repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content,
        sha: sha ?? undefined,
      }),
    },
  );
  if (!res.ok) throw new Error(await res.text().catch(() => "GitHub put failed"));
  return res.json();
}

export async function putBinary(
  path: string,
  bytes: Uint8Array,
  message: string,
  sha?: string | null,
) {
  const { owner, repo } = repoInfo();
  const content = Buffer.from(bytes).toString("base64");
  const res = await ghFetch(
    `${apiBase(owner, repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content,
        sha: sha ?? undefined,
      }),
    },
  );
  if (!res.ok) throw new Error(await res.text().catch(() => "GitHub put failed"));
  return res.json();
}

export async function ensurePackagesJson() {
  const path = "metadata/packages.json";
  const existing = await getFile(path);
  if (existing) return;
  await putJson(path, [], "Initialize packages metadata");
}

