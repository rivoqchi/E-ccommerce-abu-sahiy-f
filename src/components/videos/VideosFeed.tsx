"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Gauge,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { StoryVideo, VideoQuality } from "@/types/story";
import {
  initials,
  readVideoQuality,
  resolveVideoSrc,
  writeVideoQuality,
} from "@/lib/video-quality";
import { cn } from "@/lib/utils";

interface VideosFeedProps {
  videos: StoryVideo[];
}

function usePersistedQuality(): [VideoQuality, (q: VideoQuality) => void] {
  const quality = useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    () => readVideoQuality(),
    () => "auto" as VideoQuality,
  );

  const setQuality = useCallback((q: VideoQuality) => {
    writeVideoQuality(q);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return [quality, setQuality];
}

export function VideosFeed({ videos }: VideosFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [quality, setQuality] = usePersistedQuality();
  const [qualityOpen, setQualityOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-reel-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          const idx = Number(entry.target.getAttribute("data-reel-index"));
          if (!Number.isFinite(idx)) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index: idx, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.55) {
          setActive(best.index);
          setPaused(false);
        }
      },
      { root, threshold: [0.55, 0.75, 0.9] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [videos.length]);

  if (!videos.length) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
        <p className="text-lg font-semibold">Hozircha videolar yoʻq</p>
        <p className="text-sm text-white/60">
          Tez orada yangi videolar qoʻshiladi
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Bosh sahifa
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] bg-black text-white">
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
          aria-label="Orqaga"
        >
          <ChevronLeft className="size-6" strokeWidth={2} />
        </Link>
        <p className="pointer-events-none text-sm font-semibold tracking-tight drop-shadow">
          Videolar
        </p>
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setQualityOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
            aria-label="Video sifati"
          >
            <Gauge className="size-5" strokeWidth={1.75} />
          </button>
          {qualityOpen ? (
            <div className="absolute right-0 top-11 w-40 overflow-hidden rounded-xl bg-neutral-900/95 py-1 shadow-xl ring-1 ring-white/10">
              {(
                [
                  ["auto", "Avto"],
                  ["high", "Yuqori"],
                  ["low", "Tejamkor"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setQuality(value);
                    setQualityOpen(false);
                  }}
                  className={cn(
                    "flex w-full px-3 py-2.5 text-left text-sm",
                    quality === value
                      ? "bg-white/15 font-semibold"
                      : "text-white/80 hover:bg-white/10",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="h-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video, index) => (
          <ReelSlide
            key={video.id}
            video={video}
            index={index}
            isActive={index === active}
            shouldWarm={Math.abs(index - active) <= 1}
            muted={muted}
            paused={paused && index === active}
            quality={quality}
            onToggleMute={() => setMuted((m) => !m)}
            onTogglePause={() => setPaused((p) => !p)}
          />
        ))}
      </div>
    </div>
  );
}

function ReelSlide({
  video,
  index,
  isActive,
  shouldWarm,
  muted,
  paused,
  quality,
  onToggleMute,
  onTogglePause,
}: {
  video: StoryVideo;
  index: number;
  isActive: boolean;
  shouldWarm: boolean;
  muted: boolean;
  paused: boolean;
  quality: VideoQuality;
  onToggleMute: () => void;
  onTogglePause: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = resolveVideoSrc(video, quality);
  const loadSrc = isActive || shouldWarm ? src : undefined;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !loadSrc) return;

    if (isActive && !paused) {
      el.muted = muted;
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [isActive, paused, muted, loadSrc]);

  return (
    <section
      data-reel-index={index}
      className="relative h-[100dvh] w-full shrink-0 snap-start snap-always"
    >
      <video
        key={loadSrc ?? `idle-${index}`}
        ref={videoRef}
        src={loadSrc}
        className="absolute inset-0 size-full object-cover"
        playsInline
        loop
        muted={muted}
        preload={isActive ? "auto" : shouldWarm ? "metadata" : "none"}
        poster={video.thumbnailUrl}
        onClick={onTogglePause}
      />

      {/* Scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />

      {/* Side controls */}
      <div className="absolute right-3 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-20 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
          aria-label={muted ? "Ovoz" : "Ovozsiz"}
        >
          {muted ? (
            <VolumeX className="size-5" />
          ) : (
            <Volume2 className="size-5" />
          )}
        </button>
        <button
          type="button"
          onClick={onTogglePause}
          className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
          aria-label={paused ? "Davom ettirish" : "Pauza"}
        >
          {paused ? (
            <Play className="size-5 fill-white" />
          ) : (
            <Pause className="size-5" />
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-1 ring-white/25">
            {video.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold">
                {initials(video.authorName)}
              </span>
            )}
          </span>
          <p className="truncate text-sm font-semibold drop-shadow">
            {video.authorName}
          </p>
        </div>
        {video.caption ? (
          <p className="mt-2 line-clamp-3 text-sm leading-snug text-white/90 drop-shadow">
            {video.caption}
          </p>
        ) : null}
      </div>
    </section>
  );
}
