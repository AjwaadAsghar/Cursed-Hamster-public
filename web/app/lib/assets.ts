// Heavy assets the camera page needs. Shared with the landing page so it can
// warm the browser cache before the user even clicks "Start".

export const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

// The SIMD build is what FilesetResolver picks on every modern browser.
export const WASM_FILES = [`${WASM_URL}/vision_wasm_internal.js`, `${WASM_URL}/vision_wasm_internal.wasm`];

export const MODEL_URLS = {
  hand: "/models/hand_landmarker.task",
  face: "/models/face_landmarker.task",
  pose: "/models/pose_landmarker.task",
} as const;

export async function fetchModel(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}
