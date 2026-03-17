import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFile, getJson, putJson, deleteFile } from "@/lib/github-storage";
import type { PackageMeta } from "@/lib/package-types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const username = session?.user?.githubUsername;

  if (!session?.user?.id || !username) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ ok: false, error: "Missing package name" }, { status: 400 });

    const metaPath = "metadata/packages.json";
    const { data: packages, sha: metaSha } = await getJson<PackageMeta[]>(metaPath, []);

    const pkgIndex = packages.findIndex((p) => p.name === name);
    if (pkgIndex === -1) {
      return NextResponse.json({ ok: false, error: "Package not found" }, { status: 404 });
    }

    const pkg = packages[pkgIndex];
    if (pkg.user !== username) {
      return NextResponse.json({ ok: false, error: "Permission denied" }, { status: 403 });
    }

    // 1. Delete all version ZIP files
    for (const version of pkg.versions) {
      const zipPath = `packages/${pkg.name}/${version}.zip`;
      try {
        const file = await getFile(zipPath);
        if (file?.sha) {
          await deleteFile(zipPath, file.sha, `Delete ${pkg.name}@${version} by ${username}`);
        }
      } catch (e) {
        console.error(`Failed to delete ZIP for ${pkg.name}@${version}:`, e);
        // Continue deleting others even if one fails
      }
    }

    // 2. Update metadata
    const updatedPackages = packages.filter((p) => p.name !== name);
    await putJson(metaPath, updatedPackages, `Permanent delete package ${name} by ${username}`, metaSha);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Deletion failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
