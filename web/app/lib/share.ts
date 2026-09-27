// Drawing for the shareable images/clips. Everything is laid out on a
// 1080x1350 (4:5, Instagram/TikTok friendly) base grid and scaled to
// whatever canvas size is passed in.

const BASE_W = 1080;
const BASE_H = 1350;

export type ShareFonts = { display: string; sans: string };

export function getShareFonts(): ShareFonts {
  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue("--font-fredoka").trim() || "system-ui";
  const sans = css.getPropertyValue("--font-geist-sans").trim() || "system-ui";
  return { display: `${display}, system-ui, sans-serif`, sans: `${sans}, system-ui, sans-serif` };
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, BASE_W, BASE_H);
  g.addColorStop(0, "#ffd6e8");
  g.addColorStop(0.35, "#ffb6d5");
  g.addColorStop(0.7, "#ff8fc4");
  g.addColorStop(1, "#ff6fb0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "54px system-ui";
  for (const [emoji, x, y] of [
    ["✨", 90, 90],
    ["🌻", 990, 140],
    ["⭐", 70, 1180],
    ["🥜", 1000, 1230],
  ] as const) {
    ctx.fillText(emoji, x, y);
  }
}

function drawTitle(ctx: CanvasRenderingContext2D, fonts: ShareFonts, title: string, y: number, size: number) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${size}px ${fonts.display}`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(title, BASE_W / 2, y + 5);
  ctx.fillStyle = "#a3145a";
  ctx.fillText(title, BASE_W / 2, y);
}

function drawFooter(ctx: CanvasRenderingContext2D, fonts: ShareFonts, host: string) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const text = `🐹 try it: ${host}`;
  let size = 42;
  ctx.font = `700 ${size}px ${fonts.display}`;
  while (ctx.measureText(text).width > 960 && size > 24) {
    size -= 2;
    ctx.font = `700 ${size}px ${fonts.display}`;
  }
  ctx.fillStyle = "#a3145a";
  ctx.fillText(text, BASE_W / 2, 1250);
  ctx.font = `500 28px ${fonts.sans}`;
  ctx.fillStyle = "rgba(80,10,40,0.65)";
  ctx.fillText("free, no app, runs in your browser", BASE_W / 2, 1298);
}

// Pill with auto-shrinking text so long gesture names still fit.
function drawPill(ctx: CanvasRenderingContext2D, fonts: ShareFonts, text: string, cy: number) {
  let size = 50;
  ctx.font = `700 ${size}px ${fonts.display}`;
  while (ctx.measureText(text).width > 880 && size > 26) {
    size -= 2;
    ctx.font = `700 ${size}px ${fonts.display}`;
  }
  const w = ctx.measureText(text).width + 80;
  const h = 104;
  const x = (BASE_W - w) / 2;
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "#ff6fb0");
  g.addColorStop(1, "#ff3d94");
  ctx.save();
  ctx.shadowColor = "rgba(160,20,90,0.35)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, BASE_W / 2, cy + 2);
}

// Draws `src` into the destination box like CSS object-fit: cover.
function drawCover(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  mirror = false
) {
  const scale = Math.max(dw / sw, dh / sh);
  const cw = dw / scale;
  const ch = dh / scale;
  const sx = (sw - cw) / 2;
  const sy = (sh - ch) / 2;
  ctx.save();
  if (mirror) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(src, sx, sy, cw, ch, 0, 0, dw, dh);
  } else {
    ctx.drawImage(src, sx, sy, cw, ch, dx, dy, dw, dh);
  }
  ctx.restore();
}

function clipRounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
}

function drawWhiteCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = "rgba(120,10,60,0.25)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 44);
  ctx.fill();
  ctx.restore();
}

// "Me vs the hamster" card, used for both the photo and every frame of the clip.
export function drawMatchCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  opts: {
    fonts: ShareFonts;
    meme: HTMLImageElement | undefined;
    video: HTMLVideoElement;
    caption: string;
    host: string;
  }
) {
  const { fonts, meme, video, caption, host } = opts;
  ctx.save();
  ctx.scale(width / BASE_W, width / BASE_W);
  drawBackground(ctx);
  drawTitle(ctx, fonts, "Cursed Hamster", 175, 96);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 34px ${fonts.sans}`;
  ctx.fillStyle = "rgba(80,10,40,0.7)";
  ctx.fillText("Become the hamster.", BASE_W / 2, 232);

  drawWhiteCard(ctx, 40, 285, 1000, 530);
  const size = 470;
  const y = 300;
  for (const [i, x] of [55, 555].entries()) {
    ctx.save();
    clipRounded(ctx, x, y, size, size, 30);
    ctx.fillStyle = "#2a1520";
    ctx.fillRect(x, y, size, size);
    if (i === 0 && meme && meme.naturalWidth) {
      drawCover(ctx, meme, meme.naturalWidth, meme.naturalHeight, x, y, size, size);
    } else if (i === 1 && video.videoWidth) {
      drawCover(ctx, video, video.videoWidth, video.videoHeight, x, y, size, size, true);
    }
    ctx.restore();
  }
  ctx.font = `700 30px ${fonts.display}`;
  ctx.fillStyle = "#c2185b";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("the hamster", 55 + size / 2, 802);
  ctx.fillText("me", 555 + size / 2, 802);

  drawPill(ctx, fonts, caption, 945);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 44px ${fonts.display}`;
  ctx.fillStyle = "rgba(163,20,90,0.8)";
  ctx.fillText("which hamster are you? 👀", BASE_W / 2, 1100);

  drawFooter(ctx, fonts, host);
  ctx.restore();
}

// "I became all 15 hamsters" trophy card.
export function drawCollectionCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  opts: { fonts: ShareFonts; memes: HTMLImageElement[]; host: string }
) {
  const { fonts, memes, host } = opts;
  ctx.save();
  ctx.scale(width / BASE_W, width / BASE_W);
  drawBackground(ctx);
  drawTitle(ctx, fonts, `I became all ${memes.length}`, 165, 84);
  drawTitle(ctx, fonts, "cursed hamsters 🏆", 260, 84);

  const cols = 5;
  const cell = 172;
  const gap = 18;
  const rows = Math.ceil(memes.length / cols);
  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;
  const x0 = (BASE_W - gridW) / 2;
  const y0 = 330;
  drawWhiteCard(ctx, x0 - 24, y0 - 24, gridW + 48, gridH + 48);
  memes.forEach((img, i) => {
    const x = x0 + (i % cols) * (cell + gap);
    const y = y0 + Math.floor(i / cols) * (cell + gap);
    ctx.save();
    clipRounded(ctx, x, y, cell, cell, 20);
    ctx.fillStyle = "#ffe4ef";
    ctx.fillRect(x, y, cell, cell);
    if (img.naturalWidth) drawCover(ctx, img, img.naturalWidth, img.naturalHeight, x, y, cell, cell);
    ctx.restore();
  });

  drawPill(ctx, fonts, `${memes.length}/${memes.length} found. Can you?`, 1040);
  drawFooter(ctx, fonts, host);
  ctx.restore();
}

export const CARD_ASPECT = BASE_H / BASE_W;

export function pickRecorderMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}
