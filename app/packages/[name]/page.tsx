import Link from "next/link";
import { ensurePackagesJson, getJson } from "@/lib/github-storage";
import type { PackageMeta } from "@/lib/package-types";
import { ChromeInstallButton } from "@/app/components/ChromeInstallButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function zipPath(name: string, version: string) {
  return `packages/${name}/${version}.zip`;
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  await ensurePackagesJson();
  const { data: packages } = await getJson<PackageMeta[]>("metadata/packages.json", []);
  const pkg = packages.find((p) => p.name === name);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
        <main className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
            <h1 className="text-2xl font-semibold tracking-tight">
              Package not found
            </h1>
            <div className="mt-6">
              <Link href="/" className="underline underline-offset-4">
                Back to marketplace
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const owner = process.env.GITHUB_OWNER ?? "";
  const repo = process.env.GITHUB_REPO ?? "";
  const downloadUrl = `https://raw.githubusercontent.com/${encodeURIComponent(
    owner,
  )}/${encodeURIComponent(repo)}/main/${zipPath(pkg.name, pkg.latest)}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/25 blur-3xl dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-amber-400/15" />
      </div>

      <header className="mx-auto w-full max-w-5xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline underline-offset-4 dark:text-zinc-400"
        >
          Back
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {pkg.name}{" "}
              <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                latest {pkg.latest}
              </span>
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              by @{pkg.user}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ChromeInstallButton downloadUrl={downloadUrl} packageName={pkg.name} />
            <a
              href={downloadUrl}
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-medium transition hover:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:hover:bg-zinc-950"
            >
              Download ZIP
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
              <h2 className="text-sm font-semibold">Description</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {pkg.description}
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
              <h2 className="text-sm font-semibold">Versions</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {pkg.versions
                  .slice()
                  .sort()
                  .reverse()
                  .map((v) => (
                    <a
                      key={v}
                      href={`https://raw.githubusercontent.com/${encodeURIComponent(
                        owner,
                      )}/${encodeURIComponent(repo)}/main/${zipPath(pkg.name, v)}`}
                      className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-950"
                    >
                      {v}
                    </a>
                  ))}
              </div>
            </div>
          </section>

          <aside>
            <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
              <h2 className="text-sm font-semibold">Uploader</h2>
              <div className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pkg.avatarUrl}
                  alt={pkg.user}
                  className="h-10 w-10 rounded-full"
                />
                <div className="text-sm font-medium">@{pkg.user}</div>
              </div>
              <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                Created: {new Date(pkg.createdAt).toLocaleString()}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

