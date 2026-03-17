"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { toast } from "sonner";
import type { PackageMeta } from "@/lib/package-types";

type PublishResult =
  | { ok: true; name: string; version: string; downloadUrl: string }
  | { ok: false; error: string };

declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  
  // Package Management
  const [myPackages, setMyPackages] = useState<PackageMeta[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [deletePackageName, setDeletePackageName] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasShownToast.current) {
      toast.success(`Signed in as ${session.user.name || session.user.email}`);
      hasShownToast.current = true;
      fetchMyPackages();
    } else if (status === "unauthenticated") {
      hasShownToast.current = false;
      setMyPackages([]);
      setIsLoadingPackages(false);
    }
  }, [status, session]);

  async function fetchMyPackages() {
    setIsLoadingPackages(true);
    try {
      const res = await fetch("/api/packages?t=" + Date.now());
      if (res.ok) {
        const body = await res.json();
        const username = session?.user?.githubUsername?.toLowerCase();
        if (username && body.packages) {
          setMyPackages(body.packages.filter((p: PackageMeta) => p.user.toLowerCase() === username));
        }
      }
    } catch (e) {
      console.error("Failed to fetch packages:", e);
    } finally {
      setIsLoadingPackages(false);
    }
  }

  const canPublish = useMemo(() => {
    return (
      status === "authenticated" &&
      name.trim().length > 0 &&
      version.trim().length > 0 &&
      description.trim().length > 0 &&
      !!files &&
      files.length > 0 &&
      !isUploading
    );
  }, [description, files, name, isUploading, version, status]);

  async function createZip(fileList: FileList): Promise<Blob> {
    const zip = new JSZip();
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const path = file.webkitRelativePath || file.name;
      zip.file(path, file);
    }
    return await zip.generateAsync({ type: "blob" });
  }

  async function publish() {
    let toastId: string | number | undefined;
    try {
      if (!files || files.length === 0) throw new Error("Select a folder");

      setIsUploading(true);
      toastId = toast.loading("Creating ZIP archive...");

      const zipBlob = await createZip(files);

      toast.loading("Uploading to GitHub...", { id: toastId });

      const form = new FormData();
      form.set("file", zipBlob, `${name}-${version}.zip`);
      form.set("name", name.trim());
      form.set("version", version.trim());
      form.set("description", description.trim());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = (await res.json().catch(() => null)) as
        | PublishResult
        | null;

      if (!res.ok || !data) {
        let errorMsg = "Upload failed. Check server logs.";
        if (data && "error" in data) {
          errorMsg = data.error;
        }
        toast.error(errorMsg, { id: toastId });
        setIsUploading(false);
        return;
      }

      toast.success("Package published successfully!", { id: toastId });
      setResult(data);
      
      // Clear fields immediately
      setName("");
      setVersion("1.0.0");
      setDescription("");
      setFiles(null);
      if (inputRef.current) inputRef.current.value = "";
      
      setIsUploading(false);
      fetchMyPackages(); // Refresh listing

      // Redirect after 2s
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      toast.error(msg, { id: toastId });
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!deletePackageName) return;
    
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${deletePackageName}...`);
    
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deletePackageName }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Delete failed");
      }
      
      toast.success("Package deleted permanently", { id: toastId });
      setMyPackages(prev => prev.filter(p => p.name !== deletePackageName));
      setDeletePackageName(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Deletion failed";
      toast.error(msg, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  }

  const handleRestrictedAction = () => {
    if (status !== "authenticated") {
      toast.error("Please sign in with GitHub first");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/25 blur-3xl dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-amber-400/15" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-violet-400/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-violet-500/10" />
      </div>

      <header className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              ExtensionHub
              <span className="text-zinc-500 dark:text-zinc-400">· Publish</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Publish a package
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
             <Link href="/" className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-white/90 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:bg-zinc-950/80">
              Back
            </Link>
            {status === "authenticated" && (
              <button
                onClick={() => signOut()}
                className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-white/90 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:bg-zinc-950/80"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Select a folder to upload. It will be zipped automatically.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-16 space-y-8">
        {/* Upload Form */}
        <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
          <h2 className="text-lg font-semibold mb-6">Create New Release</h2>
          {status !== "authenticated" ? (
            <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
              <div className="font-semibold">Sign in required</div>
              <div className="mt-1">
                You must sign in with GitHub to upload packages.
              </div>
              <div className="mt-3">
                <button
                  onClick={() => signIn("github", { callbackUrl: "/upload" })}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 transition hover:brightness-110 dark:shadow-fuchsia-400/10"
                >
                  Sign in with GitHub
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Signed in as <span className="font-semibold text-zinc-900 dark:text-zinc-100">{session?.user?.name || session?.user?.email}</span>
            </div>
          )}

          <div 
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onClick={handleRestrictedAction}
          >
            <label className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <input
                disabled={status !== "authenticated"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="react-dashboard"
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm font-medium">Version</div>
              <input
                disabled={status !== "authenticated"}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="1.0.0"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium">Description</div>
              <textarea
                disabled={status !== "authenticated"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[96px] w-full resize-y rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/60 dark:focus:ring-indigo-500/40"
                placeholder="Admin panel UI"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className="text-sm font-medium">Package Folder</div>
              <input
                type="file"
                ref={inputRef}
                webkitdirectory=""
                directory=""
                multiple
                disabled={status !== "authenticated"}
                onChange={(e) => setFiles(e.target.files)}
                className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-indigo-600 file:via-fuchsia-600 file:to-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300"
              />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {files ? `${files.length} files selected` : "Select the folder containing your extension."}
              </div>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-400" />
            <button
              disabled={!canPublish}
              onClick={publish}
              className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-fuchsia-400/10"
            >
              Upload package
            </button>
          </div>
        </div>

        {/* Your Extensions List */}
        {status === "authenticated" && (
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
            <h2 className="text-lg font-semibold mb-6">Your Extensions</h2>
            {isLoadingPackages ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
              </div>
            ) : myPackages.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                You haven't uploaded any extensions yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myPackages.map((pkg) => (
                  <div key={pkg.name} className="flex items-center justify-between p-4 rounded-xl border border-black/5 bg-black/5 dark:border-white/5 dark:bg-white/5">
                    <div className="space-y-1">
                      <div className="font-semibold">{pkg.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {pkg.latest} • {new Date(pkg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeletePackageName(pkg.name)}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-500 hover:text-white dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {deletePackageName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold">Delete Extension?</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to permanently delete <span className="font-bold text-zinc-900 dark:text-zinc-100">{deletePackageName}</span>?
              This action cannot be undone and will remove all files from GitHub.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeletePackageName(null)}
                className="flex-1 h-10 rounded-full border border-black/10 text-sm font-semibold bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 h-10 rounded-full bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
