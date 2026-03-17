import { NextResponse } from "next/server";
import { ensurePackagesJson, getJson } from "@/lib/github-storage";

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

export async function GET() {
  try {
    await ensurePackagesJson();
    const { data } = await getJson<PackageMeta[]>("metadata/packages.json", []);
    return NextResponse.json({ ok: true, packages: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load packages";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

