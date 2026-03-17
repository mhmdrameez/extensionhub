"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PackageMeta } from "@/lib/package-types";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return (a + (b ?? "")).toUpperCase();
}

function hashToInt(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return h;
}

function accentFor(id: string | number) {
  const themes = [
    { ring: "ring-indigo-500/25", bg: "from-indigo-500 to-fuchsia-500" },
    { ring: "ring-emerald-500/25", bg: "from-emerald-500 to-sky-500" },
    { ring: "ring-amber-500/25", bg: "from-amber-500 to-rose-500" },
    { ring: "ring-violet-500/25", bg: "from-violet-500 to-cyan-500" },
    { ring: "ring-fuchsia-500/25", bg: "from-fuchsia-500 to-amber-500" },
  ];
  const n = typeof id === "number" ? id : hashToInt(id);
  return themes[Math.abs(n) % themes.length]!;
}

export function MarketplaceList({
  extensions: packages,
}: {
  extensions: PackageMeta[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return packages;

    return packages.filter((pkg) => {
      const haystack = normalize(
        [
          pkg.name,
          pkg.latest,
          pkg.user,
          pkg.description ?? "",
        ].join(" "),
      );
      return haystack.includes(q);
    });
  }, [packages, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="w-full max-w-xl">
          <div className="sr-only">Search extensions</div>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 dark:text-zinc-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 18.5C14.6421 18.5 18 15.1421 18 11C18 6.85786 14.6421 3.5 10.5 3.5C6.35786 3.5 3 6.85786 3 11C3 15.1421 6.35786 18.5 10.5 18.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20.5 20.5L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, author, version, description…"
              className="h-11 w-full rounded-2xl border border-black/10 bg-white/80 pl-11 pr-4 text-sm outline-none ring-0 transition focus:ring-2 focus:ring-indigo-300 dark:border-white/10 dark:bg-zinc-950/70 dark:focus:ring-indigo-500/40"
            />
          </div>
        </label>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing <span className="font-medium">{filtered.length}</span> of{" "}
          <span className="font-medium">{packages.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {packages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/20 bg-white/80 p-8 text-center text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-white/15 dark:bg-zinc-950/70 dark:text-zinc-400">
            No packages yet. Go to{" "}
            <Link href="/upload" className="underline underline-offset-4">
              /upload
            </Link>{" "}
            to publish your first one.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white/80 p-8 text-center text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70 dark:text-zinc-400">
            No matches for <span className="font-medium">“{query}”</span>.
          </div>
        ) : (
          filtered.map((pkg) => {
            const accent = accentFor(pkg.name);
            return (
              <article
                key={pkg.name}
                className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-zinc-950/70"
              >
              <div
                className={`pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br ${accent.bg} opacity-10 blur-2xl`}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent.bg} text-sm font-semibold text-white ring-4 ${accent.ring}`}
                      title={pkg.name}
                    >
                      {initials(pkg.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">
                        {pkg.name}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
                          latest {pkg.latest}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
                          by @{pkg.user}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          {pkg.versions.length} version{pkg.versions.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {pkg.description ? (
                    <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {pkg.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/packages/${encodeURIComponent(pkg.name)}`}
                    className="hidden h-10 items-center justify-center rounded-full border border-black/10 bg-white/60 px-5 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950 sm:inline-flex"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/packages/${encodeURIComponent(pkg.name)}`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 transition hover:brightness-110 dark:shadow-fuchsia-400/10"
                  >
                    View & download
                  </Link>
                </div>
              </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

