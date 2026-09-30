// Ported 1:1 from the Python main.py gesture-detection logic.

import { withBase } from "./site";

export type Point = { x: number; y: number; z?: number; visibility?: number };

export const GESTURE_GUIDE: { key: string; doThis: string; youGet: string }[] = [
  { key: "default", doThis: "Nothing / no match", youGet: "poker face hamster" },
  { key: "thumbs_up", doThis: "Thumbs up (away from your face)", youGet: "thumbs up hamster" },
  {
    key: "thumbs_down",
    doThis: "Thumbs down (away from your face)",
    youGet: "thumbs down hamster",
  },
  {
    key: "fist_by_head",
    doThis: "Closed fist held beside your head",
    youGet: "lollipop hamster",
  },
  {
    key: "glasses",
    doThis: "Pinch (thumb + index touching) near your face",
    youGet: "glasses hamster",
  },
  {
    key: "finger_mouth",
    doThis: "Index finger near your mouth",
    youGet: "finger-near-mouth hamster",
  },
  { key: "nerd", doThis: "Index finger up, away from your mouth", youGet: "nerd hamster" },
  {
    key: "finger_gun",
    doThis: "Finger gun: index + middle finger together, other fingers curled",
    youGet: "finger gun hamster",
  },
  {
    key: "v_sign",
    doThis: "V sign: index + middle finger up and spread apart, other fingers curled",
    youGet: "V sign hamster",
  },
  {
    key: "bicep",
    doThis: "Flex: elbow up at shoulder height and out to the side, fist raised up by your head",
    youGet: "bicep hamster",
  },
  {
    key: "cross_arms",
    doThis: "Both wrists tucked together at chest height (hands can be hidden)",
    youGet: "crossed-arms hamster",
  },
  { key: "shy", doThis: "Hand on your cheek (one hand is enough)", youGet: "shy hamster" },
  {
    key: "thinking",
    doThis: "Hands clasped together at mouth/chin height",
    youGet: "thinking hamster",
  },
  {
    key: "hug",
    doThis: "Hands clasped together at chest height, below your face",
    youGet: "hug hamster",
  },
  {
    key: "high_five",
    doThis: "Raise an open hand, all five fingers out, like a high five",
    youGet: "high five hamster",
  },
  { key: "kiss", doThis: "Pucker your lips like you're blowing a kiss", youGet: "kiss hamster" },
  {
    key: "tongue_out",
    doThis: "Stick your tongue out (mouth a little open)",
    youGet: "tongue out hamster",
  },
  { key: "sad", doThis: "Head tilted down", youGet: "sad hamster" },
  { key: "two_hands", doThis: "Two hands visible, no other match", youGet: "truck hamster" },
  { key: "side_eye", doThis: "Turn your head to the side", youGet: "side-eye hamster" },
];

export const MEMES: Record<string, string> = {
  default: withBase("/memes/poker_face.jpg"),
  thumbs_up: withBase("/memes/thumbs_up.jpg"),
  thumbs_down: withBase("/memes/thumbs_down.jpg"),
  side_eye: withBase("/memes/side_eye.jpg"),
  fist_by_head: withBase("/memes/fist_by_head.jpg"),
  two_hands: withBase("/memes/two_hands.jpg"),
  glasses: withBase("/memes/glasses.jpg"),
  bicep: withBase("/memes/bicep.jpg"),
  cross_arms: withBase("/memes/cross_arms.jpg"),
  finger_mouth: withBase("/memes/finger_mouth.jpg"),
  nerd: withBase("/memes/nerd.jpg"),
  shy: withBase("/memes/shy.jpg"),
  thinking: withBase("/memes/thinking.jpg"),
  hug: withBase("/memes/hug.jpg"),
  sad: withBase("/memes/sad.jpg"),
  finger_gun: withBase("/memes/finger_gun.jpg"),
  tongue_out: withBase("/memes/tongue_out.jpg"),
  v_sign: withBase("/memes/v_sign.jpg"),
  high_five: withBase("/memes/high_five.jpg"),
  kiss: withBase("/memes/kiss.jpg"),
};

export const YAW_THRESHOLD_DEG = 18;
export const PITCH_THRESHOLD_DEG = 15;
const GLASSES_NEAR_FACE_DIST = 0.28;
const MOUTH_NEAR_DIST = 0.14;
// Bicep = a proper flex, measured in shoulder widths so it doesn't depend on
// how far you sit from the camera: upper arm raised out to the side with the
// elbow near shoulder height, forearm up, fist well above the shoulder. The
// old rule (wrist barely above the shoulder, any bend) also matched a thumbs
// up or fist held near the shoulder whenever the hand tracker blinked.
const BICEP_ANGLE_MIN_DEG = 25;
const BICEP_ANGLE_MAX_DEG = 115;
const BICEP_WRIST_ABOVE_SHOULDER = 0.45; // wrist this far above the shoulder
const BICEP_ELBOW_MAX_BELOW_SHOULDER = 0.35; // elbow can't hang lower than this
const BICEP_ELBOW_OUT = 0.3; // elbow out past the shoulder, away from the body
const BICEP_WRIST_ABOVE_ELBOW = 0.25; // forearm pointing up
const BICEP_FALLBACK_SHOULDER_WIDTH = 0.3;
const POSE_VISIBILITY_MIN = 0.5;
const HANDS_TOGETHER_DIST = 0.12;
const HANDS_APART_MIN_DIST = 0.15;
const THINKING_NEAR_MOUTH_DIST = 0.25;
const SHY_NEAR_FACE_DIST = 0.3;
const SHY_HEIGHT_TOLERANCE = 0.18;
// One-hand shy (most people are holding their phone with the other hand):
// an open hand resting on either cheek. Measured in face widths so it
// doesn't depend on distance from the camera. "Open" (3+ fingers extended)
// keeps it from stealing a fist by the head (lollipop), a finger near the
// mouth, a finger gun or a V sign held next to the face.
const SHY_ONE_HAND_MIN_FINGERS = 3;
const SHY_ONE_HAND_MIN_SIDE = 0.25; // palm at least this far from the face's centre line...
const SHY_ONE_HAND_MAX_SIDE = 0.85; // ...but still on/at the edge of the face
const SHY_ONE_HAND_ABOVE_CHEEK = 0.45; // palm no higher than about eye level
const SHY_ONE_HAND_BELOW_CHEEK = 0.6; // and no lower than about the jaw
const FACE_EDGE_LEFT = 234,
  FACE_EDGE_RIGHT = 454;

// High five: a full open hand - all four fingers clearly extended and the
// thumb out to the side. Measured on a real phone selfie + live video:
// fingers 1.87-2.11, thumb 1.43-1.45 and 63-65 deg from the index finger;
// the raised palm sat 1.2 face widths beside the face, well clear of the
// one-hand shy zone (<= 0.85), which is checked first so a hand resting on
// the cheek stays shy.
const HIGH_FIVE_MIN_FINGER = 1.5;
const HIGH_FIVE_MIN_THUMB = 1.2;
const HIGH_FIVE_MIN_THUMB_ANGLE_DEG = 35;
const HUG_BELOW_FACE_DIST = 0.2;
// Finger gun vs V sign: both are index + middle up with ring + pinky curled;
// the angle between the two raised fingers tells them apart. Measured on
// real webcam photos and live video: finger gun 0.6-2.7 deg, V sign
// 14.8-25.4 deg. The gap between the two limits is a dead zone so a hand
// halfway between doesn't flicker.
const FINGER_GUN_MAX_ANGLE_DEG = 8;
const V_SIGN_MIN_ANGLE_DEG = 11;
// Extension ratio = wrist-to-tip / wrist-to-knuckle. The shared 1.15 cut-off
// in fingersUp is too tight for a curled ring finger in live video (it
// hovers around 1.1-1.2), so ring + pinky are judged relative to the two
// raised fingers instead.
const TWO_FINGER_MIN_RAISED = 1.3;
const TWO_FINGER_MAX_CURLED = 1.4;
const TWO_FINGER_MIN_CURL_MARGIN = 0.45;

const MOUTH_LANDMARK = 13;

// Tongue out. The face model has no usable tongue signal, but with the
// tongue out it does read the mouth as open, and the band between the lower
// lip and the chin turns tongue-pink. That band is normally chin skin or
// beard, so it's compared against the person's own cheek/nose colour, which
// keeps it working across skin tones and lighting. A shocked/yawning open
// mouth leaves that band chin-coloured and doesn't trigger it.
// Kiss: the face model's own "mouthPucker" score. Measured: kiss selfie
// 0.94, every neutral/sad/tongue-out photo 0.00-0.02.
const KISS_MIN_PUCKER = 0.5;

const TONGUE_MIN_LIP_GAP = 0.04; // inner-lip gap as a fraction of face height
const TONGUE_MIN_PINK_OVER_SKIN = 0.03; // band pinkness minus skin pinkness
const UPPER_LIP_INNER = 13,
  LOWER_LIP_INNER = 14,
  LOWER_LIP_OUTER = 17,
  CHIN = 152,
  FOREHEAD = 10,
  NOSE_TIP = 4,
  CHEEK_LEFT = 205,
  CHEEK_RIGHT = 425;

// Returns the average [r, g, b] of a square patch centred on (x, y) in video
// pixels, or null if it falls outside the frame.
export type RgbSampler = (x: number, y: number, radius: number) => [number, number, number] | null;

const FINGER_JOINTS: [number, number][] = [
  [8, 5],
  [12, 9],
  [16, 13],
  [20, 17],
];

const LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12;
const LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14;
const LEFT_WRIST = 15,
  RIGHT_WRIST = 16;
const LEFT_HIP = 23,
  RIGHT_HIP = 24;

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function center(landmarks: Point[]): [number, number] {
  let x = 0,
    y = 0;
  for (const p of landmarks) {
    x += p.x;
    y += p.y;
  }
  return [x / landmarks.length, y / landmarks.length];
}

function vecDist(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function fingersUp(landmarks: Point[]): number[] {
  const wrist = landmarks[0];
  const pinkyBase = landmarks[17];
  const thumbExtended =
    dist(landmarks[4], pinkyBase) > dist(landmarks[2], pinkyBase) * 1.1;
  const fingers = [thumbExtended ? 1 : 0];
  for (const [tipId, baseId] of FINGER_JOINTS) {
    const extended =
      dist(wrist, landmarks[tipId]) > dist(wrist, landmarks[baseId]) * 1.15;
    fingers.push(extended ? 1 : 0);
  }
  return fingers;
}

function classifySingleHand(fingers: number[]): string | null {
  const [thumb, index, middle, ring, pinky] = fingers;
  const fourCurled = !(index || middle || ring || pinky);
  if (fourCurled) return thumb ? "thumbs_up" : "fist";
  if (index && middle && ring && pinky && thumb) return "open_palm";
  if (index && !middle && !ring && !pinky) return "pointer";
  return null;
}

// Index + middle extended, ring + pinky curled: returns the angle between
// the two raised fingers, or null if the hand isn't in that shape. The thumb
// is ignored on purpose: its extension reading is the noisiest of the five.
export function twoFingerAngle(landmarks: Point[]): number | null {
  const wrist = landmarks[0];
  const ext = (tip: number, knuckle: number) => {
    const base = dist(wrist, landmarks[knuckle]);
    return base < 1e-6 ? 0 : dist(wrist, landmarks[tip]) / base;
  };
  const raised = Math.min(ext(8, 5), ext(12, 9));
  const curled = Math.max(ext(16, 13), ext(20, 17));
  if (raised < TWO_FINGER_MIN_RAISED) return null;
  if (curled > TWO_FINGER_MAX_CURLED || raised - curled < TWO_FINGER_MIN_CURL_MARGIN) return null;
  // Direction of each raised finger, knuckle to tip.
  const v1 = [landmarks[8].x - landmarks[5].x, landmarks[8].y - landmarks[5].y];
  const v2 = [landmarks[12].x - landmarks[9].x, landmarks[12].y - landmarks[9].y];
  const n1 = Math.hypot(v1[0], v1[1]);
  const n2 = Math.hypot(v2[0], v2[1]);
  if (n1 < 1e-6 || n2 < 1e-6) return null;
  const cos = Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (n1 * n2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function detectFingerGun(landmarks: Point[]): boolean {
  const angle = twoFingerAngle(landmarks);
  return angle !== null && angle < FINGER_GUN_MAX_ANGLE_DEG;
}

export function detectVSign(landmarks: Point[]): boolean {
  const angle = twoFingerAngle(landmarks);
  return angle !== null && angle > V_SIGN_MIN_ANGLE_DEG;
}

// Chromatic pinkness: how much redder than green, independent of brightness.
function pinkness([r, g, b]: [number, number, number]): number {
  const sum = r + g + b;
  return sum < 1 ? 0 : (r - g) / sum;
}

export function mouthOpenRatio(face: Point[]): number {
  const faceH = dist(face[FOREHEAD], face[CHIN]);
  return faceH < 1e-6 ? 0 : dist(face[UPPER_LIP_INNER], face[LOWER_LIP_INNER]) / faceH;
}

export function detectTongueOut(face: Point[], sample: RgbSampler, width: number, height: number): boolean {
  if (mouthOpenRatio(face) < TONGUE_MIN_LIP_GAP) return false;
  const px = (i: number) => ({ x: face[i].x * width, y: face[i].y * height });
  const faceH = Math.hypot(px(FOREHEAD).x - px(CHIN).x, px(FOREHEAD).y - px(CHIN).y);
  if (faceH < 20) return false;

  const avgPink = (points: { x: number; y: number }[], radius: number): number | null => {
    const vals = points.map((p) => sample(p.x, p.y, radius)).filter((c): c is [number, number, number] => !!c);
    return vals.length ? vals.reduce((s, c) => s + pinkness(c), 0) / vals.length : null;
  };

  const lip = px(LOWER_LIP_OUTER);
  const chin = px(CHIN);
  const band = [0.15, 0.35, 0.55, 0.75].map((t) => ({
    x: lip.x + (chin.x - lip.x) * t,
    y: lip.y + (chin.y - lip.y) * t,
  }));
  const bandPink = avgPink(band, faceH * 0.02);
  const skinPink = avgPink([px(NOSE_TIP), px(CHEEK_LEFT), px(CHEEK_RIGHT)], faceH * 0.025);
  if (bandPink === null || skinPink === null) return false;
  return bandPink - skinPink > TONGUE_MIN_PINK_OVER_SKIN;
}

function thumbDyRatio(landmarks: Point[]): number {
  const scale = dist(landmarks[0], landmarks[9]);
  if (scale < 1e-6) return 0;
  return (landmarks[4].y - landmarks[0].y) / scale;
}

function thumbPointsDown(landmarks: Point[]): boolean {
  return thumbDyRatio(landmarks) > 0.35;
}

function isPinch(landmarks: Point[]): boolean {
  const scale = dist(landmarks[0], landmarks[9]);
  if (scale < 1e-6) return false;
  const thumbIndex = dist(landmarks[4], landmarks[8]);
  const thumbMiddle = dist(landmarks[4], landmarks[12]);
  return thumbIndex < scale * 0.5 && thumbIndex < thumbMiddle * 0.7;
}

function poseVisible(landmark: Point | undefined): boolean {
  if (!landmark) return false;
  return (landmark.visibility ?? 1.0) >= POSE_VISIBILITY_MIN;
}

function elbowAngleDegrees(shoulder: Point, elbow: Point, wrist: Point): number | null {
  const v1 = [shoulder.x - elbow.x, shoulder.y - elbow.y];
  const v2 = [wrist.x - elbow.x, wrist.y - elbow.y];
  const n1 = Math.hypot(v1[0], v1[1]);
  const n2 = Math.hypot(v2[0], v2[1]);
  if (n1 < 1e-6 || n2 < 1e-6) return null;
  const cos = Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (n1 * n2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Landmarks the pose model guesses outside the frame are unreliable; a flex
// has to actually be on screen.
function inFrame(p: Point): boolean {
  return p.x > -0.02 && p.x < 1.02 && p.y > -0.02 && p.y < 1.02;
}

function detectBicep(pose: Point[] | null): boolean {
  if (!pose) return false;
  const lS = pose[LEFT_SHOULDER],
    rS = pose[RIGHT_SHOULDER];
  const bothShoulders = poseVisible(lS) && poseVisible(rS);
  const shoulderWidth = bothShoulders ? dist(lS, rS) : BICEP_FALLBACK_SHOULDER_WIDTH;
  if (shoulderWidth < 1e-6) return false;
  const bodyCenterX = bothShoulders ? (lS.x + rS.x) / 2 : null;

  for (const [shoulderI, elbowI, wristI] of [
    [LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST],
    [RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST],
  ]) {
    const shoulder = pose[shoulderI];
    const elbow = pose[elbowI];
    const wrist = pose[wristI];
    if (!poseVisible(shoulder) || !poseVisible(elbow) || !poseVisible(wrist)) continue;
    if (!inFrame(elbow) || !inFrame(wrist)) continue;

    const angle = elbowAngleDegrees(shoulder, elbow, wrist);
    if (angle === null || angle < BICEP_ANGLE_MIN_DEG || angle > BICEP_ANGLE_MAX_DEG) continue;

    const wristAbove = (shoulder.y - wrist.y) / shoulderWidth;
    const elbowBelow = (elbow.y - shoulder.y) / shoulderWidth;
    const wristAboveElbow = (elbow.y - wrist.y) / shoulderWidth;
    // Out to the side = further from the body's centre line than the shoulder.
    const outward =
      bodyCenterX === null
        ? Math.abs(elbow.x - shoulder.x)
        : Math.sign(shoulder.x - bodyCenterX) * (elbow.x - shoulder.x);
    const elbowOut = outward / shoulderWidth;

    if (
      wristAbove > BICEP_WRIST_ABOVE_SHOULDER &&
      elbowBelow < BICEP_ELBOW_MAX_BELOW_SHOULDER &&
      elbowOut > BICEP_ELBOW_OUT &&
      wristAboveElbow > BICEP_WRIST_ABOVE_ELBOW
    )
      return true;
  }
  return false;
}

function detectCrossArms(pose: Point[] | null): boolean {
  if (!pose) return false;
  const lWrist = pose[LEFT_WRIST],
    rWrist = pose[RIGHT_WRIST];
  const lShoulder = pose[LEFT_SHOULDER],
    rShoulder = pose[RIGHT_SHOULDER];
  if (
    !poseVisible(lWrist) ||
    !poseVisible(rWrist) ||
    !poseVisible(lShoulder) ||
    !poseVisible(rShoulder)
  )
    return false;

  const lHip = pose[LEFT_HIP],
    rHip = pose[RIGHT_HIP];
  const chestTop = Math.min(lShoulder.y, rShoulder.y);
  const chestBottom =
    poseVisible(lHip) && poseVisible(rHip) ? Math.max(lHip.y, rHip.y) : chestTop + 0.35;

  const wristsClose = dist(lWrist, rWrist) < 0.18;
  const avgWristY = (lWrist.y + rWrist.y) / 2;
  const atChestHeight = chestTop < avgWristY && avgWristY < chestBottom;
  return wristsClose && atChestHeight;
}

function twoHandCenters(hands: Point[][]): [number, number][] | null {
  if (hands.length !== 2) return null;
  return [center(hands[0]), center(hands[1])];
}

function detectShy(hands: Point[][], headCenter: [number, number] | null): boolean {
  const centers = twoHandCenters(hands);
  if (!centers || !headCenter) return false;
  if (vecDist(centers[0], centers[1]) <= HANDS_APART_MIN_DIST) return false;
  return centers.every(
    (c) =>
      vecDist(c, headCenter) < SHY_NEAR_FACE_DIST &&
      Math.abs(c[1] - headCenter[1]) < SHY_HEIGHT_TOLERANCE
  );
}

export function detectHighFive(h: Point[]): boolean {
  const ext = (tip: number, knuckle: number) => {
    const base = dist(h[0], h[knuckle]);
    return base < 1e-6 ? 0 : dist(h[0], h[tip]) / base;
  };
  if (Math.min(ext(8, 5), ext(12, 9), ext(16, 13), ext(20, 17)) < HIGH_FIVE_MIN_FINGER) return false;
  const thumbBase = dist(h[2], h[17]);
  if (thumbBase < 1e-6 || dist(h[4], h[17]) / thumbBase < HIGH_FIVE_MIN_THUMB) return false;
  // Thumb direction (its base joint to tip) vs index direction (knuckle to tip).
  const t = [h[4].x - h[2].x, h[4].y - h[2].y];
  const i = [h[8].x - h[5].x, h[8].y - h[5].y];
  const nt = Math.hypot(t[0], t[1]);
  const ni = Math.hypot(i[0], i[1]);
  if (nt < 1e-6 || ni < 1e-6) return false;
  const cos = Math.max(-1, Math.min(1, (t[0] * i[0] + t[1] * i[1]) / (nt * ni)));
  return (Math.acos(cos) * 180) / Math.PI > HIGH_FIVE_MIN_THUMB_ANGLE_DEG;
}

function detectShyOneHand(hands: Point[][], face: Point[] | null): boolean {
  if (!face) return false;
  const faceW = dist(face[FACE_EDGE_LEFT], face[FACE_EDGE_RIGHT]);
  if (faceW < 1e-6) return false;
  const centerX = (face[FACE_EDGE_LEFT].x + face[FACE_EDGE_RIGHT].x) / 2;
  const cheekY = (face[CHEEK_LEFT].y + face[CHEEK_RIGHT].y) / 2;

  return hands.some((h) => {
    const openFingers = fingersUp(h).slice(1).reduce((n, f) => n + f, 0);
    if (openFingers < SHY_ONE_HAND_MIN_FINGERS) return false;
    // Palm centre (wrist + the four knuckles) is steadier than the whole
    // hand, whose centre moves with the fingers.
    const palm = [0, 5, 9, 13, 17].map((i) => h[i]);
    const px = palm.reduce((s, p) => s + p.x, 0) / palm.length;
    const py = palm.reduce((s, p) => s + p.y, 0) / palm.length;
    const side = Math.abs(px - centerX) / faceW;
    const dy = (py - cheekY) / faceW;
    return (
      side >= SHY_ONE_HAND_MIN_SIDE &&
      side <= SHY_ONE_HAND_MAX_SIDE &&
      dy >= -SHY_ONE_HAND_ABOVE_CHEEK &&
      dy <= SHY_ONE_HAND_BELOW_CHEEK
    );
  });
}

function detectThinking(hands: Point[][], mouthPoint: [number, number] | null): boolean {
  const centers = twoHandCenters(hands);
  if (!centers || !mouthPoint) return false;
  if (vecDist(centers[0], centers[1]) >= HANDS_TOGETHER_DIST) return false;
  const avg: [number, number] = [
    (centers[0][0] + centers[1][0]) / 2,
    (centers[0][1] + centers[1][1]) / 2,
  ];
  return vecDist(avg, mouthPoint) < THINKING_NEAR_MOUTH_DIST;
}

function detectHug(hands: Point[][], headCenter: [number, number] | null): boolean {
  const centers = twoHandCenters(hands);
  if (!centers || !headCenter) return false;
  if (vecDist(centers[0], centers[1]) >= HANDS_TOGETHER_DIST) return false;
  const avg: [number, number] = [
    (centers[0][0] + centers[1][0]) / 2,
    (centers[0][1] + centers[1][1]) / 2,
  ];
  return avg[1] - headCenter[1] > HUG_BELOW_FACE_DIST;
}

export function headYawDegrees(m: number[][]): number {
  const r02 = m[0][2];
  return (Math.asin(Math.max(-1, Math.min(1, r02))) * 180) / Math.PI;
}

export function headPitchDegrees(m: number[][]): number {
  const r12 = m[1][2];
  return (Math.asin(Math.max(-1, Math.min(1, -r12))) * 180) / Math.PI;
}

export type ClassifyResult = {
  gesture: string;
  yawDeg: number | null;
  pitchDeg: number | null;
};

export function classifyGesture(
  handsLandmarks: Point[][],
  faceLandmarks: Point[][] | null,
  faceTransformMatrices: number[][][] | null,
  poseLandmarksList: Point[][] | null,
  tongueOut = false,
  puckerScore = 0
): ClassifyResult {
  const pose = poseLandmarksList && poseLandmarksList.length ? poseLandmarksList[0] : null;

  let headCenter: [number, number] = [0.5, 0.3];
  let mouthPoint: [number, number] | null = null;
  let yawDeg: number | null = null;
  let pitchDeg: number | null = null;
  const hasFace = !!(faceLandmarks && faceLandmarks.length);

  if (hasFace) {
    const face = faceLandmarks![0];
    headCenter = center(face);
    mouthPoint = [face[MOUTH_LANDMARK].x, face[MOUTH_LANDMARK].y];
  }
  if (faceTransformMatrices && faceTransformMatrices.length) {
    yawDeg = headYawDegrees(faceTransformMatrices[0]);
    pitchDeg = headPitchDegrees(faceTransformMatrices[0]);
  }

  let fingerGun = false;
  let vSign = false;
  for (const landmarks of handsLandmarks) {
    const handC = center(landmarks);

    if (isPinch(landmarks)) {
      const nearFace = vecDist(handC, headCenter) < GLASSES_NEAR_FACE_DIST;
      if (nearFace) return { gesture: "glasses", yawDeg, pitchDeg };
      continue;
    }

    const fingers = fingersUp(landmarks);
    const gesture = classifySingleHand(fingers);

    if (gesture === "fist" || gesture === "thumbs_up") {
      // A flexing fist sits beside the head too; a strict flex wins over
      // "fist by head" (which is the elbow-down version). Thumbs up never
      // becomes bicep.
      if (gesture === "fist" && detectBicep(pose)) return { gesture: "bicep", yawDeg, pitchDeg };
      const besideHead =
        Math.abs(handC[1] - headCenter[1]) < 0.15 &&
        Math.abs(handC[0] - headCenter[0]) > 0.08 &&
        Math.abs(handC[0] - headCenter[0]) < 0.3;
      if (besideHead) return { gesture: "fist_by_head", yawDeg, pitchDeg };
      if (gesture === "thumbs_up") {
        return {
          gesture: thumbPointsDown(landmarks) ? "thumbs_down" : "thumbs_up",
          yawDeg,
          pitchDeg,
        };
      }
      continue;
    }

    if (gesture === "pointer") {
      const fingertip: [number, number] = [landmarks[8].x, landmarks[8].y];
      const nearMouth = mouthPoint !== null && vecDist(fingertip, mouthPoint) < MOUTH_NEAR_DIST;
      return { gesture: nearMouth ? "finger_mouth" : "nerd", yawDeg, pitchDeg };
    }

    if (detectFingerGun(landmarks)) fingerGun = true;
    else if (detectVSign(landmarks)) vSign = true;
  }

  if (detectShy(handsLandmarks, hasFace ? headCenter : null))
    return { gesture: "shy", yawDeg, pitchDeg };
  if (detectThinking(handsLandmarks, mouthPoint)) return { gesture: "thinking", yawDeg, pitchDeg };
  if (detectHug(handsLandmarks, hasFace ? headCenter : null))
    return { gesture: "hug", yawDeg, pitchDeg };
  // After the two-hand clasps, so hands clasped by the chin stay "thinking".
  if (detectShyOneHand(handsLandmarks, hasFace ? faceLandmarks![0] : null))
    return { gesture: "shy", yawDeg, pitchDeg };
  if (handsLandmarks.some(detectHighFive)) return { gesture: "high_five", yawDeg, pitchDeg };

  // After the clasped-hands shapes (so a clasp that happens to read as two
  // fingers up stays "thinking"/"hug"), but before the pose-based fallbacks:
  // a raised finger gun otherwise reads as "bicep".
  if (fingerGun) return { gesture: "finger_gun", yawDeg, pitchDeg };
  if (vSign) return { gesture: "v_sign", yawDeg, pitchDeg };

  if (detectCrossArms(pose)) return { gesture: "cross_arms", yawDeg, pitchDeg };
  if (detectBicep(pose)) return { gesture: "bicep", yawDeg, pitchDeg };

  // Deliberate face gesture: beats the "two hands" catch-all and the head
  // tilt/turn ones (sticking your tongue out often tips the head a bit).
  if (tongueOut && hasFace) return { gesture: "tongue_out", yawDeg, pitchDeg };
  if (puckerScore > KISS_MIN_PUCKER && hasFace) return { gesture: "kiss", yawDeg, pitchDeg };

  if (handsLandmarks.length === 2) return { gesture: "two_hands", yawDeg, pitchDeg };

  if (pitchDeg !== null && pitchDeg > PITCH_THRESHOLD_DEG)
    return { gesture: "sad", yawDeg, pitchDeg };
  if (yawDeg !== null && Math.abs(yawDeg) > YAW_THRESHOLD_DEG)
    return { gesture: "side_eye", yawDeg, pitchDeg };

  return { gesture: "default", yawDeg, pitchDeg };
}

export function displayGestureName(gesture: string): string {
  return gesture
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
