import type { StoryVideo, VideoQuality } from "@/types/story";

const QUALITY_KEY = "sami-video-quality";

export function readVideoQuality(): VideoQuality {
  if (typeof window === "undefined") return "auto";
  try {
    const v = localStorage.getItem(QUALITY_KEY);
    if (v === "high" || v === "low" || v === "auto") return v;
  } catch {
    /* ignore */
  }
  return "auto";
}

export function writeVideoQuality(q: VideoQuality) {
  try {
    localStorage.setItem(QUALITY_KEY, q);
  } catch {
    /* ignore */
  }
}

/**
 * Pick media URL based on quality preference + network when Auto.
 * Low uses compressed variant when available; otherwise high.
 */
export function resolveVideoSrc(
  video: Pick<StoryVideo, "mediaUrl" | "mediaUrlLow">,
  quality: VideoQuality,
): string {
  if (quality === "high") return video.mediaUrl;
  if (quality === "low") return video.mediaUrlLow || video.mediaUrl;

  // Auto: prefer low on slow connections / save-data
  if (typeof navigator !== "undefined") {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.saveData) return video.mediaUrlLow || video.mediaUrl;
    const et = conn?.effectiveType;
    if (et === "slow-2g" || et === "2g" || et === "3g") {
      return video.mediaUrlLow || video.mediaUrl;
    }
  }
  return video.mediaUrl;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
