"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import { MODEL_URLS, WASM_URL, fetchModel } from "../lib/assets";
import ShareModal, { type ShareResult } from "../components/ShareModal";
import {
  CARD_ASPECT,
  drawCollectionCard,
  drawMatchCard,
  getShareFonts,
  pickRecorderMime,
} from "../lib/share";
import {
  addFound,
  getFoundServerSnapshot,
  getFoundSnapshot,
  parseFound,
  resetFound,
  subscribeFound,
} from "../lib/collection";

const PANEL = 480; // meme/cam panel size (px)
const VOTE_WINDOW = 12;
const VOTE_MAJORITY = 7;

// Only hand tracking needs to run every frame for gestures to feel
// responsive. Face and pose move slowly by comparison, so running them on
// a fraction of frames cuts CPU-delegate inference cost substantially
// without hurting accuracy.
const FACE_EVERY_N = 2;
const POSE_EVERY_N = 3;

const CLIP_MS = 5000;
const TOTAL_HAMSTERS = GESTURE_GUIDE.length;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hamsterName(key: string) {
  return GESTURE_GUIDE.find((g) => g.key === key)?.youGet ?? `${displayGestureName(key)} hamster`;
}

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
  const [loadStep, setLoadStep] = useState("Asking for your camera…");
  const [cameraOn, setCameraOn] = useState(false);
  const guideListRef = useRef<HTMLDivElement>(null);
  const debugOnRef = useRef(debugOn);
  useEffect(() => {
    debugOnRef.current = debugOn;
  }, [debugOn]);

  // Snapshot / clip / collection state.
  const memeImgsRef = useRef<Record<string, HTMLImageElement>>({});
  const gestureRef = useRef(gesture);
  const [capture, setCapture] = useState<"idle" | "countdown" | "recording">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [recProgress, setRecProgress] = useState(0);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [notice, setNotice] = useState("");
  const foundSnapshot = useSyncExternalStore(subscribeFound, getFoundSnapshot, getFoundServerSnapshot);
  const found = parseFound(foundSnapshot);
  const onStableGestureRef = useRef<(g: string) => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let rafId = 0;
    let hand: HandLandmarker | null = null;
    let face: FaceLandmarker | null = null;
    let pose: PoseLandmarker | null = null;

    async function setup() {
      try {
        // Kick everything off at once instead of one after another: the
        // camera prompt, the three model downloads and the WASM runtime all
        // load in parallel. Only the hand model gates the "ready" state -
        // face and pose plug in as soon as they finish, and until then the
        // classifier just sees "no face / no pose", same as when you're out
        // of frame.
        const visionP = FilesetResolver.forVisionTasks(WASM_URL);
        // Start the WASM download now; the task constructors below fetch the
        // same URL and get it from the HTTP cache.
        visionP
          .then((v) => Promise.all([fetch(v.wasmLoaderPath), fetch(v.wasmBinaryPath)]))
          .catch(() => {});
        // Face/pose wait for the hand model so they don't steal bandwidth
        // from the one download that actually gates startup.
        const handBufP = fetchModel(MODEL_URLS.hand);
        const afterHand = handBufP.catch(() => {});
        const faceBufP = afterHand.then(() => fetchModel(MODEL_URLS.face));
        const poseBufP = afterHand.then(() => fetchModel(MODEL_URLS.pose));
        for (const p of [handBufP, faceBufP, poseBufP]) p.catch(() => {});

        // Lower capture resolution than the display panel needs: fewer
        // pixels per frame means noticeably cheaper CPU-delegate inference,
        // with no visible quality loss once scaled up to PANEL size.
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) return;

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;
        setCameraOn(true);
        setLoadStep("Waking up the hamster…");

        const vision = await visionP;

        // CPU delegates: running three GPU/WebGL-backed models concurrently in
        // one tab makes them fight over WebGL contexts (observed as repeated
        // "Graph finished closing" churn and an uncaught crash from inside
        // the vision library). CPU delegates avoid that entirely.
        hand = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetBuffer: await handBufP, delegate: "CPU" },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        if (cancelled) return;
        setStatus("ready");

        faceBufP
          .then((buf) =>
            FaceLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetBuffer: buf, delegate: "CPU" },
              runningMode: "VIDEO",
              numFaces: 1,
              minFaceDetectionConfidence: 0.6,
              minTrackingConfidence: 0.6,
              outputFacialTransformationMatrixes: true,
            })
          )
          .then((f) => {
            if (cancelled) f.close();
            else face = f;
          })
          .catch((err) => console.error("face model failed", err));

        poseBufP
          .then((buf) =>
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetBuffer: buf, delegate: "CPU" },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5,
            })
          )
          .then((p) => {
            if (cancelled) p.close();
            else pose = p;
          })
          .catch((err) => console.error("pose model failed", err));

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

          if (face && frameCount % FACE_EVERY_N === 0) {
            const faceResult = face.detectForVideo(video, now);
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

          if (pose && frameCount % POSE_EVERY_N === 0) {
            const poseResult = pose.detectForVideo(video, now);
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
            onStableGestureRef.current(stableGesture);
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

  // Warm the browser cache so switching memes never flashes an empty panel,
  // and keep the decoded images around for drawing share cards.
  useEffect(() => {
    for (const [key, src] of Object.entries(MEMES)) {
      const img = new Image();
      img.src = src;
      memeImgsRef.current[key] = img;
    }
  }, []);

  useEffect(() => {
    gestureRef.current = gesture;
  }, [gesture]);

  const openResult = useCallback((result: Omit<ShareResult, "url">) => {
    setShareResult({ ...result, url: URL.createObjectURL(result.blob) });
  }, []);

  const closeResult = useCallback(() => {
    setShareResult((r) => {
      if (r) URL.revokeObjectURL(r.url);
      return null;
    });
  }, []);

  const showCollectionCard = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = Math.round(1080 * CARD_ASPECT);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCollectionCard(ctx, canvas.width, {
      fonts: getShareFonts(),
      memes: GESTURE_GUIDE.map((g) => memeImgsRef.current[g.key]).filter(Boolean),
      host: window.location.host,
    });
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        openResult({
          kind: "image",
          blob,
          filename: "cursed-hamster-all.jpg",
          heading: `You became all ${TOTAL_HAMSTERS} hamsters! 🏆`,
          shareText: `I became all ${TOTAL_HAMSTERS} cursed hamsters 🐹🏆 can you? ${window.location.origin}`,
        });
      },
      "image/jpeg",
      0.92
    );
  }, [openResult]);

  useEffect(() => {
    onStableGestureRef.current = (g: string) => {
      const total = addFound(g);
      if (total === TOTAL_HAMSTERS) showCollectionCard();
    };
  }, [showCollectionCard]);

  async function runCountdown() {
    setCapture("countdown");
    for (let n = 3; n > 0; n--) {
      setCountdown(n);
      await wait(1000);
    }
    setCountdown(null);
  }

  async function takeSnapshot() {
    const video = videoRef.current;
    if (!video || capture !== "idle") return;
    await runCountdown();
    setFlash(true);
    setTimeout(() => setFlash(false), 180);

    const key = gestureRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = Math.round(1080 * CARD_ASPECT);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCapture("idle");
      return;
    }
    drawMatchCard(ctx, canvas.width, {
      fonts: getShareFonts(),
      meme: memeImgsRef.current[key],
      video,
      caption: `I became the ${hamsterName(key)}`,
      host: window.location.host,
    });
    canvas.toBlob(
      (blob) => {
        setCapture("idle");
        if (!blob) return;
        openResult({
          kind: "image",
          blob,
          filename: "cursed-hamster.jpg",
          heading: `You became the ${hamsterName(key)} ✨`,
          shareText: `I became the ${hamsterName(key)} 🐹 ${window.location.origin}`,
        });
      },
      "image/jpeg",
      0.92
    );
  }

  async function recordClip() {
    const video = videoRef.current;
    if (!video || capture !== "idle") return;
    const mime = pickRecorderMime();
    if (!mime || !("captureStream" in HTMLCanvasElement.prototype)) {
      setNotice("Video recording isn't supported in this browser. Try a photo instead!");
      setTimeout(() => setNotice(""), 3500);
      return;
    }
    await runCountdown();
    setCapture("recording");
    setRecProgress(0);

    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = Math.round(720 * CARD_ASPECT);
    const ctx = canvas.getContext("2d")!;
    const fonts = getShareFonts();
    const host = window.location.host;
    const draw = () =>
      drawMatchCard(ctx, canvas.width, {
        fonts,
        meme: memeImgsRef.current[gestureRef.current],
        video,
        caption: `I became the ${hamsterName(gestureRef.current)}`,
        host,
      });
    draw();

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      draw();
      setRecProgress(Math.min(1, (performance.now() - start) / CLIP_MS));
      raf = requestAnimationFrame(tick);
    };

    const done = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.start(250);
    raf = requestAnimationFrame(tick);
    await wait(CLIP_MS);
    cancelAnimationFrame(raf);
    recorder.stop();
    await done;
    stream.getTracks().forEach((t) => t.stop());
    setCapture("idle");
    setRecProgress(0);

    const type = mime.split(";")[0];
    const blob = new Blob(chunks, { type });
    openResult({
      kind: "video",
      blob,
      filename: `cursed-hamster.${type === "video/mp4" ? "mp4" : "webm"}`,
      heading: "Your hamster clip 🎬",
      shareText: `I became the hamster 🐹 ${window.location.origin}`,
    });
  }

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
        className="cam-card w-full overflow-hidden rounded-2xl shadow-2xl shadow-pink-900/20 ring-4 ring-white/70"
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
            <h1 className="font-display truncate text-[17px] font-semibold tracking-tight text-pink-100">
              Cursed Hamster <span aria-hidden="true">🐹</span>
              <span className="sr-only"> hamster meme webcam filter</span>
            </h1>
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
        <div className="flex flex-col sm:flex-row" style={{ background: "#1a1015" }}>
          <div className="cam-panel aspect-square w-full overflow-hidden sm:w-1/2" style={{ background: "#2a1520" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={gesture}
              src={MEMES[gesture] ?? MEMES.default}
              alt={label}
              className="h-full w-full animate-[meme-in_0.25s_ease-out] object-cover"
            />
          </div>
          <div className="h-[3px] w-full sm:h-auto sm:w-[3px]" style={{ background: "#ffb6d5" }} />
          <div className="cam-panel relative aspect-square w-full sm:w-1/2" style={{ background: "#1a1015" }}>
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
            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/25">
                <span
                  key={countdown}
                  className="font-display text-[88px] font-bold leading-none text-white drop-shadow-lg sm:text-[120px]"
                  style={{ animation: "pop 0.3s ease-out" }}
                >
                  {countdown}
                </span>
                <span className="mt-2 rounded-full bg-black/40 px-3 py-1 text-sm font-semibold text-white">
                  strike your pose!
                </span>
              </div>
            )}
            {capture === "recording" && (
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                REC {Math.ceil((1 - recProgress) * (CLIP_MS / 1000))}s
              </div>
            )}
            {capture === "recording" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
                <div className="h-full bg-red-500" style={{ width: `${recProgress * 100}%` }} />
              </div>
            )}
            {flash && <div className="pointer-events-none absolute inset-0 bg-white" />}
            {status === "loading" && (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center ${
                  cameraOn ? "bg-black/40" : ""
                }`}
              >
                <span className="text-5xl" style={{ animation: "wobble 1.2s ease-in-out infinite" }}>
                  🐹
                </span>
                <span className="font-display text-lg font-semibold text-pink-100">{loadStep}</span>
                <span className="text-xs text-pink-200/60">first load can take a few seconds</span>
              </div>
            )}
          </div>
        </div>

        {/* Snapshot / clip actions */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 px-2 py-2.5 sm:px-3 sm:py-3"
          style={{ background: "linear-gradient(90deg, #2a1520, #3a1a2a)" }}
        >
          <button
            type="button"
            onClick={takeSnapshot}
            disabled={status !== "ready" || capture !== "idle"}
            className="btn-shine font-display flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[15px] font-semibold text-white sm:gap-2 sm:px-6 sm:text-base shadow-lg shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
          >
            📸 Snap photo
          </button>
          <button
            type="button"
            onClick={recordClip}
            disabled={status !== "ready" || capture !== "idle"}
            className="font-display flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-[15px] font-semibold text-pink-100 sm:gap-2 sm:px-6 sm:text-base ring-1 ring-pink-200/30 transition-all hover:scale-105 hover:bg-white/15 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {capture === "recording" ? "🔴 Recording…" : "🎬 Record 5s"}
          </button>
          {notice && <p className="w-full text-center text-xs font-medium text-pink-200">{notice}</p>}
        </div>
      </div>

        {/* Gesture guide */}
        <div
          className="cam-guide flex w-full flex-col overflow-hidden rounded-2xl bg-white/90 shadow-2xl shadow-pink-900/20 ring-4 ring-white/70 backdrop-blur lg:w-[340px]"
          style={{ maxWidth: PANEL }}
        >
          <div
            className="flex shrink-0 items-center gap-2 px-4"
            style={{ height: 52, background: "linear-gradient(90deg, #ff6fb0, #ff9ecb)" }}
          >
            <span className="text-lg">🙌</span>
            <span className="font-display text-[17px] font-semibold text-white">Gestures to try</span>
            {found.length >= TOTAL_HAMSTERS ? (
              <button
                type="button"
                onClick={showCollectionCard}
                className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-pink-600 shadow-sm transition-transform hover:scale-105"
              >
                🏆 share
              </button>
            ) : (
              <span className="ml-auto rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold text-white">
                {found.length}/{TOTAL_HAMSTERS} found
              </span>
            )}
          </div>
          <div className="h-1.5 w-full shrink-0 bg-pink-100">
            <div
              className="h-full transition-[width] duration-500"
              style={{
                width: `${(found.length / TOTAL_HAMSTERS) * 100}%`,
                background: "linear-gradient(90deg, #ff6fb0, #ff3d94)",
              }}
            />
          </div>
          <div ref={guideListRef} className="relative divide-y divide-pink-100 overflow-y-auto">
            {GESTURE_GUIDE.map((g) => {
              const active = g.key === gesture;
              const isFound = found.includes(g.key);
              return (
                <div
                  key={g.key}
                  data-key={g.key}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                    active ? "bg-pink-100/80" : "hover:bg-pink-50/70"
                  }`}
                  style={active ? { boxShadow: "inset 4px 0 0 #ff6fb0" } : undefined}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={MEMES[g.key] ?? MEMES.default}
                      alt=""
                      width={44}
                      height={44}
                      className={`h-11 w-11 rounded-lg object-cover shadow-sm transition-all ${
                        active ? "scale-110 ring-2 ring-pink-400" : ""
                      } ${isFound || active ? "" : "opacity-45 grayscale"}`}
                    />
                    {isFound && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white ring-2 ring-white">
                        ✓
                      </span>
                    )}
                  </div>
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
            {found.length > 0 && (
              <div className="flex justify-center py-2.5">
                <button
                  type="button"
                  onClick={resetFound}
                  className="px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-pink-600"
                >
                  reset my progress
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {shareResult && <ShareModal key={shareResult.url} result={shareResult} onClose={closeResult} />}
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
