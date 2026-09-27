"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FilesetResolver,
  HandLandmarker,
  FaceLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import {
  MEMES,
  GESTURE_GUIDE,
  classifyGesture,
  displayGestureName,
  type Point,
} from "../lib/gestures";
import FloatingEmojis from "../components/FloatingEmojis";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const PANEL = 480; // meme/cam panel size (px)
const VOTE_WINDOW = 12;
const VOTE_MAJORITY = 7;

// Only hand tracking needs to run every frame for gestures to feel
// responsive. Face and pose move slowly by comparison, so running them on
// a fraction of frames cuts CPU-delegate inference cost substantially
// without hurting accuracy.
const FACE_EVERY_N = 2;
const POSE_EVERY_N = 3;

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [debugOn, setDebugOn] = useState(true);
  const [gesture, setGesture] = useState("default");
  const [loadStep, setLoadStep] = useState("Waking up the hamster…");
  const guideListRef = useRef<HTMLDivElement>(null);
  const debugOnRef = useRef(debugOn);
  useEffect(() => {
    debugOnRef.current = debugOn;
  }, [debugOn]);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let rafId = 0;
    let hand: HandLandmarker | null = null;
    let face: FaceLandmarker | null = null;
    let pose: PoseLandmarker | null = null;

    async function setup() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);

        // CPU delegates: running three GPU/WebGL-backed models concurrently in
        // one tab makes them fight over WebGL contexts (observed as repeated
        // "Graph finished closing" churn and an uncaught crash from inside
        // the vision library). CPU delegates avoid that entirely.
        hand = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate: "CPU" },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        setLoadStep("Teaching it what faces look like…");
        face = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/face_landmarker.task", delegate: "CPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
          outputFacialTransformationMatrixes: true,
        });

        setLoadStep("Stretching its little arms…");
        pose = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/pose_landmarker.task", delegate: "CPU" },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Lower capture resolution than the display panel needs: fewer
        // pixels per frame means noticeably cheaper CPU-delegate inference,
        // with no visible quality loss once scaled up to PANEL size.
        setLoadStep("Asking for your camera…");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) return;

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        if (cancelled) return;
        setStatus("ready");

        const votes: string[] = [];
        let stableGesture = "default";
        let frameCount = 0;
        let lastFaceLandmarks: Point[][] = [];
        let lastFaceMatrices: number[][][] | null = null;
        let lastPoseLandmarks: Point[][] = [];

        const loop = () => {
          if (cancelled) return;
          try {
            renderFrame();
          } catch (err) {
            console.error("frame error", err);
          }
          rafId = requestAnimationFrame(loop);
        };

        const renderFrame = () => {
          const now = performance.now();
          if (video.readyState < 2) return;

          frameCount += 1;

          const handResult = hand!.detectForVideo(video, now);
          const handsLandmarks = (handResult.landmarks ?? []) as Point[][];

          if (frameCount % FACE_EVERY_N === 0) {
            const faceResult = face!.detectForVideo(video, now);
            lastFaceLandmarks = (faceResult.faceLandmarks ?? []) as Point[][];
            lastFaceMatrices = faceResult.facialTransformationMatrixes
              ? faceResult.facialTransformationMatrixes.map((m) => {
                  // MediaPipe packs this as a column-major 4x4 (it's meant to
                  // be usable directly as an OpenGL model matrix), so
                  // M[row][col] = data[col*4 + row], not data[row*4 + col].
                  const d = m.data;
                  const rows: number[][] = [];
                  for (let r = 0; r < 4; r++) {
                    rows.push([d[r], d[4 + r], d[8 + r], d[12 + r]]);
                  }
                  return rows;
                })
              : null;
          }

          if (frameCount % POSE_EVERY_N === 0) {
            const poseResult = pose!.detectForVideo(video, now);
            lastPoseLandmarks = (poseResult.landmarks ?? []) as Point[][];
          }

          const { gesture: detected, yawDeg, pitchDeg } = classifyGesture(
            handsLandmarks,
            lastFaceLandmarks.length ? lastFaceLandmarks : null,
            lastFaceMatrices,
            lastPoseLandmarks.length ? lastPoseLandmarks : null
          );

          votes.push(detected);
          if (votes.length > VOTE_WINDOW) votes.shift();
          const counts: Record<string, number> = {};
          for (const v of votes) counts[v] = (counts[v] ?? 0) + 1;
          let topGesture = stableGesture;
          let topCount = 0;
          for (const [g, c] of Object.entries(counts)) {
            if (c > topCount) {
              topCount = c;
              topGesture = g;
            }
          }
          if (topCount >= VOTE_MAJORITY && topGesture !== stableGesture) {
            stableGesture = topGesture;
            setGesture(stableGesture);
          }

          drawOverlay(
            overlayRef.current,
            video,
            handsLandmarks,
            debugOnRef.current,
            yawDeg,
            pitchDeg,
            lastFaceLandmarks.length > 0
          );
        };
        rafId = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    setup();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "d") setDebugOn((d) => !d);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      hand?.close();
      face?.close();
      pose?.close();
    };
  }, []);

  // Warm the browser cache so switching memes never flashes an empty panel.
  useEffect(() => {
    for (const src of Object.values(MEMES)) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  // Keep the active gesture visible in the guide list without scrolling the
  // page itself (scrollIntoView would also scroll the window on mobile).
  useEffect(() => {
    const list = guideListRef.current;
    const row = list?.querySelector<HTMLElement>(`[data-key="${gesture}"]`);
    if (!list || !row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - (list.clientHeight - row.offsetHeight) / 2, behavior: "smooth" });
    }
  }, [gesture]);

  const label = displayGestureName(gesture);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center gap-4 overflow-x-hidden p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(160deg, #ffd6e8 0%, #ffb6d5 35%, #ff8fc4 70%, #ff6fb0 100%)",
      }}
    >
      <FloatingEmojis />

      <div className="relative z-10 flex w-full max-w-[962px] items-center justify-between gap-2 lg:max-w-[1318px]">
        <Link
          href="/"
          className="flex items-center gap-1 rounded-full bg-white/55 px-4 py-1.5 text-sm font-semibold text-pink-900/80 shadow-sm backdrop-blur transition-colors hover:bg-white/80 hover:text-pink-900"
        >
          &larr; back
        </Link>
        <button
          type="button"
          onClick={() => setDebugOn((d) => !d)}
          aria-pressed={debugOn}
          className="flex items-center gap-2 rounded-full bg-white/55 py-1.5 pl-2 pr-4 text-sm font-semibold text-pink-900/80 shadow-sm backdrop-blur transition-colors hover:bg-white/80"
          title="Shortcut: press D"
        >
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${
              debugOn ? "bg-pink-500" : "bg-zinc-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                debugOn ? "left-[18px]" : "left-0.5"
              }`}
            />
          </span>
          tracking lines
        </button>
      </div>

      {status === "error" && (
        <div className="relative z-10 flex max-w-md flex-col items-center gap-3 rounded-2xl bg-white/90 px-6 py-5 text-center shadow-lg backdrop-blur">
          <span className="text-4xl">🙈</span>
          <p className="font-display text-lg font-semibold text-pink-900">
            The hamster can&apos;t see you
          </p>
          <p className="text-sm text-zinc-600">
            {errorMsg}. Make sure you allowed camera access for this site, and that no other app
            is using the camera.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 rounded-full px-5 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
          >
            Try again
          </button>
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-[962px] flex-col items-center gap-4 lg:max-w-none lg:flex-row lg:items-start lg:justify-center">
      <div
        className="w-full overflow-hidden rounded-2xl shadow-2xl shadow-pink-900/20 ring-4 ring-white/70"
        style={{ maxWidth: PANEL * 2 + 2 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2 px-4"
          style={{
            height: 52,
            background: "linear-gradient(90deg, #2a1520, #3a1a2a)",
            borderBottom: "1px solid rgba(255,150,200,0.25)",
          }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {status === "ready" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  status === "ready" ? "bg-emerald-400" : status === "error" ? "bg-red-400" : "bg-amber-300"
                }`}
              />
            </span>
            <span className="font-display truncate text-[17px] font-semibold tracking-tight text-pink-100">
              Cursed Hamster 🐹
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[13px] font-semibold text-pink-200/70 sm:inline">gesture:</span>
            <span
              key={gesture}
              className="animate-[pop_0.25s_ease-out] rounded-full px-3.5 py-1.5 text-[13px] font-bold shadow-sm"
              style={{ background: "linear-gradient(90deg, #ff9ecb, #ff6fb0)", color: "#3a0d24" }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Meme on top, camera below - stacked on mobile; side by side from
            sm upward. */}
        <div className="flex flex-col sm:flex-row">
          <div className="aspect-square w-full overflow-hidden sm:w-1/2" style={{ background: "#2a1520" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={gesture}
              src={MEMES[gesture] ?? MEMES.default}
              alt={label}
              className="h-full w-full animate-[meme-in_0.25s_ease-out] object-cover"
            />
          </div>
          <div className="h-[3px] w-full sm:h-auto sm:w-[3px]" style={{ background: "#ffb6d5" }} />
          <div className="relative aspect-square w-full sm:w-1/2" style={{ background: "#1a1015" }}>
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{
                transform: "scaleX(-1)",
              }}
            />
            {/* Hand-landmark overlay, mirrored the same way as the video so
                drawn coordinates don't need their own mirroring logic. Its
                drawing-buffer resolution stays fixed at PANEL and is scaled
                visually by CSS to match whatever size the video renders at. */}
            <canvas
              ref={overlayRef}
              width={PANEL}
              height={PANEL}
              className="absolute inset-0 h-full w-full"
              style={{
                transform: "scaleX(-1)",
                pointerEvents: "none",
              }}
            />
            {status === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="text-5xl" style={{ animation: "wobble 1.2s ease-in-out infinite" }}>
                  🐹
                </span>
                <span className="font-display text-lg font-semibold text-pink-100">{loadStep}</span>
                <span className="text-xs text-pink-200/60">first load can take a few seconds</span>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Gesture guide */}
        <div
          className="flex w-full flex-col overflow-hidden rounded-2xl bg-white/90 shadow-2xl shadow-pink-900/20 ring-4 ring-white/70 backdrop-blur lg:w-[340px]"
          style={{ maxWidth: PANEL, maxHeight: PANEL + 52 }}
        >
          <div
            className="flex shrink-0 items-center gap-2 px-4"
            style={{ height: 52, background: "linear-gradient(90deg, #ff6fb0, #ff9ecb)" }}
          >
            <span className="text-lg">🙌</span>
            <span className="font-display text-[17px] font-semibold text-white">Gestures to try</span>
            <span className="ml-auto rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold text-white">
              {GESTURE_GUIDE.length}
            </span>
          </div>
          <div ref={guideListRef} className="relative divide-y divide-pink-100 overflow-y-auto">
            {GESTURE_GUIDE.map((g) => {
              const active = g.key === gesture;
              return (
                <div
                  key={g.key}
                  data-key={g.key}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                    active ? "bg-pink-100/80" : "hover:bg-pink-50/70"
                  }`}
                  style={active ? { boxShadow: "inset 4px 0 0 #ff6fb0" } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={MEMES[g.key] ?? MEMES.default}
                    alt=""
                    width={44}
                    height={44}
                    className={`h-11 w-11 shrink-0 rounded-lg object-cover shadow-sm transition-transform ${
                      active ? "scale-110 ring-2 ring-pink-400" : ""
                    }`}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px] font-medium leading-snug text-zinc-800">{g.doThis}</span>
                    <span
                      className={`text-[12px] font-semibold ${
                        active ? "text-pink-700" : "text-pink-500"
                      }`}
                    >
                      → {g.youGet} {active ? "✨" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function drawOverlay(
  canvas: HTMLCanvasElement | null,
  video: HTMLVideoElement,
  handsLandmarks: Point[][],
  debugOn: boolean,
  yawDeg: number | null,
  pitchDeg: number | null,
  faceDetected: boolean
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!debugOn) return;

  // Debug readout (mirrored back upright via a canvas-local flip, since the
  // whole canvas element is CSS-mirrored for the hand overlay).
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);
  ctx.fillStyle = "rgba(42,21,32,0.6)";
  ctx.fillRect(0, 0, 230, 26);
  ctx.font = "13px monospace";
  ctx.fillStyle = "#ffd6e8";
  ctx.textBaseline = "top";
  const yawText = yawDeg !== null ? yawDeg.toFixed(1) : "n/a";
  const pitchText = pitchDeg !== null ? pitchDeg.toFixed(1) : "n/a";
  ctx.fillText(
    `face=${faceDetected ? "yes" : "no"} yaw=${yawText} pitch=${pitchText}`,
    8,
    6
  );
  ctx.restore();

  if (!handsLandmarks.length) return;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;

  // Video is displayed with object-fit: cover into a square panel, which
  // crops to a centered square of the smaller native dimension - map
  // normalized landmark coords through that same crop to land correctly.
  const side = Math.min(vw, vh);
  const cropX0 = (vw - side) / 2;
  const cropY0 = (vh - side) / 2;
  const scale = PANEL / side;

  const toPanel = (p: Point): [number, number] => [
    (p.x * vw - cropX0) * scale,
    (p.y * vh - cropY0) * scale,
  ];

  for (const landmarks of handsLandmarks) {
    const points = landmarks.map(toPanel);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.moveTo(points[a][0], points[a][1]);
      ctx.lineTo(points[b][0], points[b][1]);
    }
    ctx.stroke();

    ctx.fillStyle = "#ff3d94";
    for (const [x, y] of points) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
