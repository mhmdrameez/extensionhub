"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/25 blur-3xl dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-amber-400/15" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-violet-400/20 blur-3xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-violet-500/10" />
      </div>

      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              ExtensionHub
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to publish
            </h1>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Login is required to upload extensions and access moderation
              features.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 transition hover:brightness-110 dark:shadow-fuchsia-400/10"
            >
              Continue with GitHub
            </button>
          </div>

          <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
            Only GitHub OAuth sign-in is supported.
          </p>
        </div>
      </main>
    </div>
  );
}

