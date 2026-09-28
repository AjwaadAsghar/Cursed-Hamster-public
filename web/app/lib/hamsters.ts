// SEO content for every hamster: one indexable page each at /hamsters/<slug>.
// Detection lives in gestures.ts; this file only adds names, copy and slugs.
// When a new gesture is added to GESTURE_GUIDE, add its entry here too - the
// build fails if one is missing.

import { GESTURE_GUIDE, MEMES } from "./gestures";

type HamsterCopy = {
  slug: string;
  name: string;
  // One-line summary used for meta descriptions and cards.
  tagline: string;
  // Longer unique description shown on the hamster's own page.
  about: string;
  // When people use this meme.
  useItFor: string[];
  // Plain-language steps to trigger it on camera.
  howTo: string[];
};

const COPY: Record<string, HamsterCopy> = {
  default: {
    slug: "poker-face",
    name: "Poker Face Hamster",
    tagline: "The deadpan hamster in a bucket hat that feels absolutely nothing.",
    about:
      "The poker face hamster is the resting state of the whole collection: a hamster in a green bucket hat staring straight through the screen with zero emotion. It is the face you make when someone explains something you already knew, or when the group chat goes quiet.",
    useItFor: ["Unimpressed reactions", "Ignoring drama", "Pretending you didn't see that"],
    howTo: [
      "Look at the camera with a neutral face.",
      "Keep your hands out of frame (or relaxed and still).",
      "If nothing else matches, you become the poker face hamster.",
    ],
  },
  thumbs_up: {
    slug: "thumbs-up",
    name: "Thumbs Up Hamster",
    tagline: "A cheerful hamster giving a big approving thumbs up.",
    about:
      "The thumbs up hamster approves. Wholeheartedly, maybe a little too enthusiastically. It is the perfect cursed reply to good news, a finished task or a plan you are fully on board with.",
    useItFor: ["Saying yes", "Approving a plan", "Congratulating a friend"],
    howTo: [
      "Make a fist and stick your thumb straight up.",
      "Hold it away from your face, around chest height.",
      "Hold still for a moment so the hamster locks in.",
    ],
  },
  thumbs_down: {
    slug: "thumbs-down",
    name: "Thumbs Down Hamster",
    tagline: "A disappointed hamster giving a sad thumbs down.",
    about:
      "The thumbs down hamster disapproves, and it wants you to know it is not angry, just disappointed. Use it for bad takes, cancelled plans and anything that did not go to plan.",
    useItFor: ["Saying no", "Reacting to bad news", "Rating a terrible idea"],
    howTo: [
      "Make a fist and point your thumb straight down.",
      "Keep your hand away from your face.",
      "Hold the pose for a second.",
    ],
  },
  fist_by_head: {
    slug: "lollipop",
    name: "Lollipop Hamster",
    tagline: "A chaotic hamster in a propeller hat with a giant rainbow lollipop.",
    about:
      "The lollipop hamster is pure unhinged joy: propeller hat, huge open grin and a rainbow lollipop held up beside its head. It is the energy of a sugar rush at 2am.",
    useItFor: ["Hyper excitement", "Chaotic good vibes", "Celebrating tiny wins"],
    howTo: [
      "Make a closed fist, like you're holding a lollipop.",
      "Hold it up beside your head, level with your face.",
      "Keep it a little to the side, not in front of your face.",
    ],
  },
  glasses: {
    slug: "glasses",
    name: "Glasses Hamster",
    tagline: "A hamster adjusting its glasses with serious moderator energy.",
    about:
      "The glasses hamster pinches its glasses and holds its phone like it is about to explain the rules. It is the meme for well-actually moments, fact checks and anyone about to moderate the chat.",
    useItFor: ["Well actually moments", "Fact checking", "Moderator energy"],
    howTo: [
      "Touch your thumb and index finger together in a pinch.",
      "Bring the pinch up near your face, like you're adjusting glasses.",
      "Hold it there for a second.",
    ],
  },
  finger_mouth: {
    slug: "finger-near-mouth",
    name: "Finger Near Mouth Hamster",
    tagline: "A hamster with one finger at its mouth, thinking something suspicious.",
    about:
      "The finger near mouth hamster is quietly plotting. One finger at the lips, eyes slightly off: it is the face of someone who knows something, or who is about to say something they shouldn't.",
    useItFor: ["Hmm moments", "Keeping a secret", "Suspicious thinking"],
    howTo: [
      "Raise just your index finger, other fingers curled.",
      "Bring the fingertip to your lips.",
      "Hold it there so the hamster can see it near your mouth.",
    ],
  },
  nerd: {
    slug: "nerd",
    name: "Nerd Hamster",
    tagline: "A nerd hamster in thick glasses with one finger raised to make a point.",
    about:
      "The nerd hamster has one finger in the air and a correction ready. Thick black glasses, smug little smile: this is the meme for pedantic replies and \"um, actually\" energy.",
    useItFor: ["Um actually replies", "Making a point", "Teasing a know-it-all"],
    howTo: [
      "Raise your index finger straight up, other fingers curled.",
      "Keep it away from your mouth (otherwise it's the finger near mouth hamster).",
      "Hold the pose for a second.",
    ],
  },
  finger_gun: {
    slug: "finger-gun",
    name: "Finger Gun Hamster",
    tagline: "A smug hamster making finger guns with a devious grin.",
    about:
      "The finger gun hamster leans in with a devious grin and its hands ready for finger guns. It is the meme for smooth replies, playful threats and anything said with way too much confidence.",
    useItFor: ["Smooth replies", "Playful threats", "Too much confidence"],
    howTo: [
      "Stick out your index and middle fingers, held together.",
      "Curl your ring finger and pinky; the thumb can do whatever it wants.",
      "Point it anywhere and hold it for a second.",
    ],
  },
  bicep: {
    slug: "bicep",
    name: "Bicep Hamster",
    tagline: "A buff hamster flexing its bicep.",
    about:
      "The bicep hamster flexes. Tiny body, questionable arm, unlimited confidence. Use it after the gym, after a win, or any time you feel stronger than you look.",
    useItFor: ["Gym posts", "Feeling strong", "Flexing a win"],
    howTo: [
      "Lift your arm out to the side so your elbow is at shoulder height.",
      "Bend it and raise your fist up by your head: a proper flex 💪.",
      "Sit back a little so your shoulders, elbow and fist are all in frame.",
    ],
  },
  cross_arms: {
    slug: "crossed-arms",
    name: "Crossed Arms Hamster",
    tagline: "A dramatic hamster lying in a coffin with its arms crossed and flowers.",
    about:
      "The crossed arms hamster has left the chat permanently. Arms crossed over a bouquet, X eyes, resting in a coffin: it is the meme for being dead from laughter, exhaustion or embarrassment.",
    useItFor: ["I'm dead", "Too tired to function", "Dying of embarrassment"],
    howTo: [
      "Cross your arms over your chest.",
      "Keep your wrists close together at chest height.",
      "Your hands can be hidden; step back so your upper body is in frame.",
    ],
  },
  shy: {
    slug: "shy",
    name: "Shy Hamster",
    tagline: "A blushing shy hamster with floppy ears and sparkly eyes.",
    about:
      "The shy hamster blushes with big sparkly eyes and floppy bunny-like ears. It is the softest hamster in the collection, made for compliments, crushes and being flustered.",
    useItFor: ["Receiving compliments", "Being flustered", "Cute replies"],
    howTo: [
      "Put one hand on each cheek.",
      "Keep your hands apart, one on each side of your face.",
      "Hold still and look cute.",
    ],
  },
  thinking: {
    slug: "thinking",
    name: "Thinking Hamster",
    tagline: "A thoughtful hamster with its hands clasped, deep in thought.",
    about:
      "The thinking hamster clasps its hands and considers everything very carefully. It is the meme for hard decisions, overthinking and pretending you are about to say something wise.",
    useItFor: ["Overthinking", "Hard decisions", "Plotting"],
    howTo: [
      "Clasp your hands together.",
      "Hold them up at mouth or chin height.",
      "Pause dramatically.",
    ],
  },
  hug: {
    slug: "hug",
    name: "Hug Hamster",
    tagline: "A happy hamster hugging a tiny hamster plushie.",
    about:
      "The hug hamster holds a tiny hamster plushie close with a big blushing smile. It is the meme for sending hugs, comfort and anything wholesome.",
    useItFor: ["Sending hugs", "Comforting a friend", "Wholesome moments"],
    howTo: [
      "Clasp your hands together.",
      "Hold them at chest height, below your face, like hugging something small.",
      "Hold the pose for a second.",
    ],
  },
  sad: {
    slug: "sad",
    name: "Sad Hamster",
    tagline: "A sad hamster with a bindle, looking down and leaving home.",
    about:
      "The sad hamster packs its bindle and looks down at the floor. It is the meme for rejection, disappointment and dramatically leaving the conversation.",
    useItFor: ["Feeling sad", "Getting rejected", "Dramatic exits"],
    howTo: [
      "Tilt your head down, like you're looking at the floor.",
      "Keep your face visible to the camera.",
      "Hold it for a second.",
    ],
  },
  two_hands: {
    slug: "truck",
    name: "Truck Hamster",
    tagline: "A hamster standing in front of a giant semi truck.",
    about:
      "The truck hamster stands, arms out, in front of an enormous semi truck. Nobody knows why. It is the meme for chaos, bad timing and things about to go very wrong.",
    useItFor: ["Incoming chaos", "Bad timing", "Random energy"],
    howTo: [
      "Show both of your hands to the camera.",
      "Don't make any of the other two-hand poses.",
      "Wave them around if the hamster doesn't notice.",
    ],
  },
  side_eye: {
    slug: "side-eye",
    name: "Side Eye Hamster",
    tagline: "A suspicious hamster giving major side eye.",
    about:
      "The side eye hamster turns away but keeps one eye on you. It is the meme for suspicion, judgment and hearing something you absolutely do not believe.",
    useItFor: ["Suspicion", "Silent judgment", "Not buying it"],
    howTo: [
      "Turn your head to the side.",
      "Keep your face in frame.",
      "Hold it for a second.",
    ],
  },
};

export type Hamster = HamsterCopy & {
  key: string;
  image: string;
  doThis: string;
};

export const HAMSTERS: Hamster[] = GESTURE_GUIDE.map((g) => {
  const copy = COPY[g.key];
  if (!copy) throw new Error(`Missing SEO copy for hamster "${g.key}" in app/lib/hamsters.ts`);
  return { ...copy, key: g.key, image: MEMES[g.key] ?? MEMES.default, doThis: g.doThis };
});

export function getHamster(slug: string): Hamster | undefined {
  return HAMSTERS.find((h) => h.slug === slug);
}

export function hamsterPath(h: Hamster): string {
  return `/hamsters/${h.slug}`;
}
