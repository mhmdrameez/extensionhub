"use client";

import { useState, useEffect } from "react";

interface ChromeInstallButtonProps {
  downloadUrl: string;
  packageName: string;
}

export function ChromeInstallButton({ downloadUrl, packageName }: ChromeInstallButtonProps) {
  const [isChrome, setIsChrome] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isChromium = !!(window as any).chrome;
    const isEdge = navigator.userAgent.indexOf("Edg") > -1;
    const isBrave = (navigator as any).brave !== undefined;
    
    setIsChrome(isChromium || isEdge || isBrave);
  }, []);

  if (!isChrome) return null;

  const handleInstallClick = () => {
    // Trigger download
    window.location.href = downloadUrl;
    // Show instructions
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700 dark:shadow-indigo-400/10"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add to Chrome
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4">How to install {packageName}</h3>
            
            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Since this is a manual installation, follow these steps:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Unzip the downloaded file (<strong>{packageName}.zip</strong>).</li>
                <li>Open Chrome and go to <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">chrome://extensions</code></li>
                <li>Enable <strong>Developer mode</strong> (top right toggle).</li>
                <li>Click <strong>Load unpacked</strong> and select the unzipped folder.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
