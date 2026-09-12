export type IntroAudioStatus = "pending" | "played" | "blocked-safely" | "paused" | "ended";

/** One automatic attempt, explicit retries only; video remains the clock. No polling. */
export function createIntroAudio(
  video: HTMLVideoElement,
  audio: HTMLAudioElement,
  status: (value: IntroAudioStatus) => void,
  visibility: Pick<Document, "hidden" | "addEventListener" | "removeEventListener"> = document,
) {
  let stopped = false;
  let attempted = false;
  let authorized = false;
  let pending = false;
  let mutedByUser = false;
  let revision = 0;
  const sync = () => {
    if (stopped || audio.readyState < 1) return true;
    const time = Math.max(0, video.currentTime);
    if (Number.isFinite(audio.duration) && time >= audio.duration) {
      audio.pause();
      status("ended");
      return false;
    }
    try { audio.currentTime = time; } catch { /* Metadata/seek may not yet be usable. */ }
    return true;
  };
  const pause = () => {
    revision++;
    pending = false;
    audio.pause();
    if (!stopped) status("paused");
  };
  const play = (explicit = false) => {
    if (stopped || mutedByUser || pending || video.paused || video.ended || visibility.hidden) return;
    if (!explicit && attempted && !authorized) return;
    attempted = true;
    if (!sync()) return;
    pending = true;
    const request = ++revision;
    void audio.play().then(() => {
      if (stopped || request !== revision || video.paused || visibility.hidden) {
        audio.pause();
        return;
      }
      authorized = true;
      if (sync()) status("played");
    }).catch(() => {
      if (!stopped && request === revision) {
        authorized = false;
        status("blocked-safely");
      }
    }).finally(() => { if (request === revision) pending = false; });
  };
  const playing = () => play();
  const metadata = () => { if (!audio.paused) sync(); };
  const seek = () => { if (authorized) sync(); };
  const hidden = () => { if (visibility.hidden) pause(); else if (authorized) play(); };
  const stop = () => { stopped = true; pause(); };
  const ended = () => { authorized = false; audio.pause(); if (!stopped) status("ended"); };
  const error = () => { authorized = false; pause(); if (!stopped) status("blocked-safely"); };
  video.addEventListener("playing", playing);
  video.addEventListener("pause", pause);
  video.addEventListener("waiting", pause);
  video.addEventListener("seeking", pause);
  video.addEventListener("seeked", seek);
  video.addEventListener("ended", stop);
  video.addEventListener("error", stop);
  audio.addEventListener("loadedmetadata", metadata);
  audio.addEventListener("ended", ended);
  audio.addEventListener("error", error);
  visibility.addEventListener("visibilitychange", hidden);
  return {
    enable: () => { mutedByUser = false; play(true); },
    mute: () => { mutedByUser = true; authorized = false; pause(); },
    stop,
    dispose: () => {
      stop();
      video.removeEventListener("playing", playing);
      video.removeEventListener("pause", pause);
      video.removeEventListener("waiting", pause);
      video.removeEventListener("seeking", pause);
      video.removeEventListener("seeked", seek);
      video.removeEventListener("ended", stop);
      video.removeEventListener("error", stop);
      audio.removeEventListener("loadedmetadata", metadata);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", error);
      visibility.removeEventListener("visibilitychange", hidden);
      audio.removeAttribute("src");
      audio.load();
    },
  };
}
