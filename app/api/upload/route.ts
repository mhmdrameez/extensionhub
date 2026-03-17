import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensurePackagesJson, getJson, putBinary, putJson } from "@/lib/github-storage";
import { z } from "zod";

export const runtime = "nodejs";

type PackageMeta = {
  name: string;
  description: string;
  versions: string[];
  latest: string;
  user: string;
  avatarUrl: string;
  createdAt: string;
};

const UploadSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(300),
  version: z.string().trim().min(1).max(30),
});

function getMaxZipBytes() {
  const n = Number(process.env.MAX_ZIP_BYTES ?? "8388608");
  return Number.isFinite(n) && n > 0 ? n : 8 * 1024 * 1024;
}

function getMaxUploadsPerDay() {
  const n = Number(process.env.MAX_UPLOADS_PER_DAY ?? "5");
  return Number.isFinite(n) && n > 0 ? n : 5;
}

function yyyymmddUTC(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function packageZipPath(name: string, version: string) {
  return `packages/${name}/${version}.zip`;
}

function limitPath(username: string, dateKey: string) {
  return `metadata/upload-limits/${username}/${dateKey}.json`;
}

async function bumpDailyCount(username: string) {
  const key = yyyymmddUTC();
  const path = limitPath(username, key);
  const { data, sha } = await getJson<{ count: number }>(path, { count: 0 });
  if (data.count >= getMaxUploadsPerDay()) {
    throw new Error("MAX_DAILY_UPLOADS");
  }
  await putJson(path, { count: data.count + 1 }, `Bump upload counter for ${username}`, sha);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const username = session?.user?.githubUsername;
  const avatarUrl = session?.user?.image ?? "";
  if (!session?.user?.id || !username) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const parsed = UploadSchema.safeParse({
    name: form.get("name"),
    description: form.get("description"),
    version: form.get("version"),
  });

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ ok: false, error: "Only .zip files are allowed" }, { status: 400 });
  }
  if (file.size > getMaxZipBytes()) {
    return NextResponse.json(
      { ok: false, error: `ZIP must be <= ${getMaxZipBytes()} bytes` },
      { status: 400 },
    );
  }

  const { name, description, version } = parsed.data;

  try {
    await ensurePackagesJson();

    // Limit uploads/day
    await bumpDailyCount(username);

    // Read metadata
    const metaPath = "metadata/packages.json";
    const { data: packages, sha } = await getJson<PackageMeta[]>(metaPath, []);

    const existing = packages.find((p) => p.name === name);
    if (!existing) {
      // new package name must be unique globally
      // (nothing else to check)
    } else {
      if (existing.user !== username) {
        return NextResponse.json(
          { ok: false, error: "Package name already exists" },
          { status: 409 },
        );
      }
      if (existing.versions.includes(version)) {
        return NextResponse.json(
          { ok: false, error: "This version already exists" },
          { status: 409 },
        );
      }
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const pkgPath = packageZipPath(name, version);

    await putBinary(pkgPath, bytes, `Upload ${name}@${version} by ${username}`);

    const now = new Date().toISOString();
    let updatedPackages: PackageMeta[];
    if (!existing) {
      updatedPackages = [
        ...packages,
        {
          name,
          description,
          versions: [version],
          latest: version,
          user: username,
          avatarUrl,
          createdAt: now,
        },
      ];
    } else {
      updatedPackages = packages.map((p) => {
        if (p.name !== name) return p;
        const versions = [...p.versions, version].sort();
        return {
          ...p,
          description,
          versions,
          latest: version,
        };
      });
    }

    await putJson(metaPath, updatedPackages, `Update metadata for ${name}@${version}`, sha);

    const downloadUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/${pkgPath}`;

    return NextResponse.json({
      ok: true,
      name,
      version,
      downloadUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg === "MAX_DAILY_UPLOADS") {
      return NextResponse.json(
        { ok: false, error: `Daily upload limit reached (${getMaxUploadsPerDay()}/day).` },
        { status: 429 },
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

