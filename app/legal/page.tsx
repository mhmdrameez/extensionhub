import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal & Privacy | ExtensionHub",
  description: "Terms of Service and Privacy Policy for ExtensionHub Browser Extension Marketplace.",
  alternates: {
    canonical: "https://extensionwebstore.vercel.app/legal",
  },
};

export default function LegalPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/25 blur-3xl dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-amber-400/15" />
      </div>

      <header className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline underline-offset-4 dark:text-zinc-400 transition hover:text-zinc-950 dark:hover:text-zinc-100"
        >
          Back to Marketplace
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Legal & Privacy</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-24 space-y-12">
        <section className="prose prose-zinc dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold">Privacy Policy</h2>
          <p>
            At ExtensionHub, we prioritize your privacy. This policy outlines how we handle your data when you use our platform.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-700 dark:text-zinc-300">
            <li><strong>Data Collection:</strong> We only collect minimal information required for authentication via GitHub. We do not sell your personal data.</li>
            <li><strong>Extension Storage:</strong> Extensions uploaded to ExtensionHub are stored in our GitHub repository. By uploading, you agree that your code will be publicly accessible.</li>
            <li><strong>Cookies:</strong> We use essential cookies for session management and basic analytics through Vercel Analytics.</li>
            <li><strong>Third-Party Services:</strong> We may use third-party services like GitHub for storage and Vercel for hosting. Please review their respective privacy policies.</li>
          </ul>
        </section>

        <section className="prose prose-zinc dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold">Terms of Service</h2>
          <p>
            By using ExtensionHub, you agree to the following terms and conditions:
          </p>
          <ul className="list-decimal pl-6 space-y-2 mt-4 text-zinc-700 dark:text-zinc-300">
            <li><strong>Content Ownership:</strong> You retain ownership of any extension you upload. However, you grant ExtensionHub a non-exclusive license to host and distribute the content.</li>
            <li><strong>Prohibited Content:</strong> You may not upload extensions that contain malware, spyware, or perform unauthorized actions on user devices. We reserve the right to remove any content at our discretion.</li>
            <li><strong>No Warranty:</strong> ExtensionHub is provided "as is" without any warranties. We are not responsible for any damage caused by the use of extensions downloaded from this platform.</li>
            <li><strong>Community Standards:</strong> Help us keep the marketplace safe. Report any malicious content or bugs.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
          <h3 className="text-sm font-semibold">Contact Us</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            If you have any questions regarding these policies, feel free to reach out via GitHub or email at support@extensionhub.com.
          </p>
        </section>
      </main>

      {/* JSON-LD for Legal Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Legal & Privacy | ExtensionHub",
            "description": "Terms of Service and Privacy Policy for ExtensionHub.",
            "url": "https://extensionwebstore.vercel.app/legal"
          }),
        }}
      />
    </div>
  );
}
