export type IntroPlaybackState = "idle" | "starting" | "playing" | "paused" | "blocked" | "ended" | "error";

type LinkActivation = { button: number; defaultPrevented: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean };

export function isPlainHandbookActivation(event: LinkActivation, target?: string | null, download = false) {
  return !event.defaultPrevented && event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (!target || target === "_self") && !download;
}

// Deliberately synchronous: play() must run inside the original click handler.
// No navigation, timer, render effect or awaited work precedes this invocation.
export function attemptHandbookPlayback(video: Pick<HTMLVideoElement, "play">, rejected: (error: unknown) => void) {
  try { const promise = video.play(); promise?.catch(rejected); } catch (error) { rejected(error); }
}
