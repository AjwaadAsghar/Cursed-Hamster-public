"use client";

import { useEffect } from "react";
import { MODEL_URLS, WASM_FILES } from "../lib/assets";

// Quietly downloads the camera page's models + WASM runtime while the user is
// still reading the landing page, so "Start the camera" feels instant. Skipped
// when the browser asks to save data.
export default function PrefetchModels() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const start = () => {
      for (const url of [...WASM_FILES, ...Object.values(MODEL_URLS)]) {
        fetch(url, { priority: "low" } as RequestInit).catch(() => {});
      }
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = setTimeout(start, 800);
    return () => clearTimeout(id);
  }, []);

  return null;
}
