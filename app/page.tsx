import Link from "next/link";
import { listExtensions } from "@/lib/github";
import { MarketplaceList } from "@/app/components/MarketplaceList";

export default async function Home() {
  const extensions = await listExtensions();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/25 blur-3xl dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-amber-400/15" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-violet-400/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-violet-500/10" />
      </div>

      <header className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              ExtensionHub
              <span className="text-zinc-500 dark:text-zinc-400">
                · GitHub-powered
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Discover and share browser extensions,
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-fuchsia-400 dark:to-amber-400">
                {" "}
                instantly
              </span>
              .
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Developers publish ZIPs straight to GitHub Releases. Users download
              directly — no extra backend, no approval queues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/15 transition hover:brightness-110 dark:shadow-fuchsia-400/10"
            >
              Publish extension
            </Link>
            <a
              href="https://github.com"
              className="hidden h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-medium text-zinc-800 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-950 sm:inline-flex"
            >
              Powered by GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="mb-8 rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Extensions are stored on GitHub Releases. This site lists public
            releases from your configured repo and links directly to the ZIP
            asset for download.
          </p>
        </div>

        <MarketplaceList extensions={extensions} />
      </main>
    </div>
  );
}
