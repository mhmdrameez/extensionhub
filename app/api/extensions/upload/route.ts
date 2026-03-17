import { toReleaseBody, type ExtensionMetaV1 } from "@/lib/extension-metadata";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} env var`);
  return v;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  try {
    const token = requireEnv("GITHUB_TOKEN");
    const owner = requireEnv("GITHUB_OWNER");
    const repo = requireEnv("GITHUB_REPO");

    const form = await req.formData();
    const file = form.get("file");
    const name = String(form.get("name") ?? "").trim();
    const version = String(form.get("version") ?? "").trim();
    const author = String(form.get("author") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 },
      );
    }
    if (!name || !version || !author) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 },
      );
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { ok: false, error: "File must be a .zip" },
        { status: 400 },
      );
    }

    const meta: ExtensionMetaV1 = {
      schema: "extensionhub.v1",
      name,
      version,
      author,
      description: description || undefined,
    };

    const tag = `ext-${slugify(name)}-v${slugify(version)}-${Date.now()}`;
    const releaseName = `${name} v${version}`;

    const createReleaseRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(repo)}/releases`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_name: tag,
          name: releaseName,
          body: toReleaseBody(meta),
          draft: false,
          prerelease: false,
        }),
      },
    );

    if (!createReleaseRes.ok) {
      const text = await createReleaseRes.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `GitHub release failed: ${text || "unknown"}` },
        { status: 502 },
      );
    }

    const created = (await createReleaseRes.json()) as {
      upload_url: string;
      html_url: string;
    };

    const uploadUrl = created.upload_url.replace("{?name,label}", "");
    const assetName = file.name || `${slugify(name)}-${version}.zip`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const uploadRes = await fetch(
      `${uploadUrl}?name=${encodeURIComponent(assetName)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/zip",
          "Content-Length": String(bytes.byteLength),
        },
        body: bytes,
      },
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `GitHub asset upload failed: ${text || "unknown"}` },
        { status: 502 },
      );
    }

    const asset = (await uploadRes.json()) as {
      browser_download_url?: string;
    };

    return NextResponse.json({
      ok: true,
      releaseUrl: created.html_url ?? null,
      downloadUrl: asset.browser_download_url ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

