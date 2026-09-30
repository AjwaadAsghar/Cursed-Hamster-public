"use client";

import { useEffect, useState } from "react";
import { BASE_PATH } from "../lib/site";

export type ShareResult = {
  kind: "image" | "video";
  blob: Blob;
  url: string;
  filename: string;
  heading: string;
  shareText: string;
};

export default function ShareModal({
  result,
  onClose,
}: {
  result: ShareResult;
  onClose: () => void;
}) {
  const [file] = useState(() => new File([result.blob], result.filename, { type: result.blob.type }));
  const [canShareFile] = useState(
    () => typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] })
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function share() {
    try {
      await navigator.share({ files: [file], text: result.shareText });
    } catch {
      // User cancelled the share sheet - nothing to do.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${BASE_PATH}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked - ignore.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-pink-950/50 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={result.heading}
    >
      <div
        className="flex max-h-full w-full max-w-sm flex-col items-center gap-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "pop 0.25s ease-out" }}
      >
        <p className="font-display text-center text-xl font-semibold text-pink-900">{result.heading}</p>

        {result.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.url}
            alt="Your Cursed Hamster card"
            className="mx-auto h-auto max-w-full rounded-2xl shadow-lg"
            style={{ maxHeight: "min(52vh, 52svh)" }}
          />
        ) : (
          <video
            src={result.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="mx-auto w-full rounded-2xl bg-pink-100 object-contain shadow-lg"
            style={{ aspectRatio: "4 / 5", maxHeight: "min(52vh, 52svh)" }}
          />
        )}

        <div className="flex w-full flex-col gap-2">
          {canShareFile && (
            <button
              type="button"
              onClick={share}
              className="btn-shine font-display rounded-full py-3 text-lg font-semibold text-white shadow-lg shadow-pink-600/30 transition-transform hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
            >
              Share 💌
            </button>
          )}
          <div className="flex gap-2">
            <a
              href={result.url}
              download={result.filename}
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-bold transition-colors ${
                canShareFile
                  ? "bg-pink-100 text-pink-800 hover:bg-pink-200"
                  : "text-white shadow-lg shadow-pink-600/30"
              }`}
              style={canShareFile ? undefined : { background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
            >
              Save {result.kind === "image" ? "photo" : "video"} ⬇️
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="flex-1 rounded-full bg-pink-100 py-2.5 text-sm font-bold text-pink-800 transition-colors hover:bg-pink-200"
            >
              {copied ? "Link copied ✓" : "Copy link 🔗"}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-1 text-sm font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
