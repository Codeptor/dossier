// Minimal audio module — single page-turn sample, played on sheet swap and
// link/button "select" clicks. One <audio> per call so rapid clicks layer
// instead of restarting the same instance. Mute persists in localStorage,
// defaults to UNMUTED.

const STORAGE_KEY = "codeptor-mute";
const PAGE_TURN = "/audio/page-turn.mp3";
const MOUSE_CLICK = "/audio/click.mp3";
const VOLUME = 0.45;
const CLICK_VOLUME = 0.55;

let muted = false;

export const initAudio = (): void => {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    muted = stored === "1";
  } catch {
    muted = false;
  }
};

export const setMuted = (m: boolean): void => {
  muted = m;
  try {
    localStorage.setItem(STORAGE_KEY, m ? "1" : "0");
  } catch {
    /* localStorage unavailable */
  }
};

export const toggleMute = (): boolean => {
  setMuted(!muted);
  return muted;
};

export const isMuted = (): boolean => muted;

const play = (src: string, volume = VOLUME): void => {
  if (muted) return;
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {
      /* autoplay policy or load error — ignore */
    });
  } catch {
    /* Audio constructor unavailable */
  }
};

// Sheet swap (clicking an inactive dossier sheet) → page-turn.
export const swap = (): void => play(PAGE_TURN);

// Generic select / click on a link or button → mouse-click sample.
export const click = (): void => play(MOUSE_CLICK, CLICK_VOLUME);
