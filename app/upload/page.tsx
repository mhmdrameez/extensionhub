"use client";

import JSZip from "jszip";
import { useMemo, useState } from "react";

type PublishResult =
  | { ok: true; downloadUrl: string | null; releaseUrl: string | null }
  | { ok: false; error: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function UploadPage() {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "zipping"; progress?: string }
    | { state: "uploading" }
    | { state: "done"; result: PublishResult }
  >({ state: "idle" });

  const canPublish = useMemo(() => {
    return (
      name.trim().length > 0 &&
      version.trim().length > 0 &&
      author.trim().length > 0 &&
      files.length > 0 &&
      status.state !== "zipping" &&
      status.state !== "uploading"
    );
  }, [author, files.length, name, status.state, version]);

  async function handleFolderPick(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      setFiles([]);
      return;
    }
    setFiles(Array.from(fileList));
  }

  async function buildZip() {
    const zip = new JSZip();
    const baseFolderName = `${slugify(name || "extension")}-${version}`.slice(
      0,
      80,
    );

    // Preserve folder structure when available (webkitRelativePath).
    for (const f of files) {
      const relative =
        (f as unknown as { webkitRelativePath?: string }).webkitRelativePath ||
        f.name;
      const normalized = relative.replace(/^\/+/, "");
      if (!normalized) continue;
      zip.file(`${baseFolderName}/${normalized}`, f);
    }

    setStatus({ state: "zipping", progress: "Generating ZIP…" });
    const blob = await zip.generateAsync(
      { type: "blob", compression: "DEFLATE" },
      (metadata) => {
        const pct = Math.floor(metadata.percent);
        setStatus({
          state: "zipping",
          progress: `Generating ZIP… ${pct}%`,
        });
      },
    );

    return new File([blob], `${baseFolderName}.zip`, {
      type: "application/zip",
    });
  }

  async function publish() {
    setStatus({ state: "zipping" });
    try {
      const zipFile = await buildZip();

      setStatus({ state: "uploading" });
      const form = new FormData();
      form.set("file", zipFile);
      form.set("name", name.trim());
      form.set("version", version.trim());
      form.set("author", author.trim());
      form.set("description", description.trim());

      const res = await fetch("/api/extensions/upload", {
        method: "POST",
        body: form,
      });

      const data = (await res.json().catch(() => null)) as
        | PublishResult
        | null;

      if (!res.ok || !data) {
        setStatus({
          state: "done",
          result: { ok: false, error: "Upload failed. Check server logs." },
        });
        return;
      }

      setStatus({ state: "done", result: data });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setStatus({ state: "done", result: { ok: false, error: msg } });
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/25 blur-3xl dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-amber-400/15" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-violet-400/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-violet-500/10" />
      </div>

      <header className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
            ExtensionHub
            <span className="text-zinc-500 dark:text-zinc-400">· Publish</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Publish your extension
          </h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Select your extension folder, we’ll zip it in your browser, then
            upload it to GitHub Releases.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-16">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="My Awesome Extension"
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm font-medium">Version</div>
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="1.0.0"
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm font-medium">Author</div>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="Your name / handle"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[96px] w-full resize-y rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="What does it do?"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium">Extension folder</div>
              <input
                type="file"
                // @ts-expect-error - webkitdirectory is non-standard but supported in Chromium-based browsers.
                webkitdirectory="true"
                directory="true"
                multiple
                onChange={(e) => handleFolderPick(e.target.files)}
                className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-indigo-600 file:via-fuchsia-600 file:to-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-110 dark:text-zinc-300"
              />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Selected files: {files.length}
              </div>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {status.state === "idle" ? null : status.state === "zipping" ? (
                <span>{status.progress ?? "Generating ZIP…"}</span>
              ) : status.state === "uploading" ? (
                <span>Uploading to GitHub…</span>
              ) : status.result.ok ? (
                <span>Published.</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">
                  {status.result.error}
                </span>
              )}
            </div>

            <button
              disabled={!canPublish}
              onClick={publish}
              className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-fuchsia-400/10"
            >
              Publish to GitHub
            </button>
          </div>

          {status.state === "done" && status.result.ok ? (
            <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60">
              <div className="font-medium">Links</div>
              <ul className="mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
                <li>
                  Release:{" "}
                  {status.result.releaseUrl ? (
                    <a
                      className="underline underline-offset-4"
                      href={status.result.releaseUrl}
                    >
                      {status.result.releaseUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </li>
                <li>
                  Download:{" "}
                  {status.result.downloadUrl ? (
                    <a
                      className="underline underline-offset-4"
                      href={status.result.downloadUrl}
                    >
                      {status.result.downloadUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

