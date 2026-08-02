"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clapperboard, X } from "lucide-react";
import type { Story, StoryItem } from "@/types/story";
import { initials, resolveVideoSrc, readVideoQuality } from "@/lib/video-quality";
import { cn } from "@/lib/utils";

interface HomeStoriesProps {
  stories: Story[];
  hasVideos: boolean;
}

export function HomeStories({ stories, hasVideos }: HomeStoriesProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!stories.length && !hasVideos) return null;

  return (
    <section aria-label="Istoriyalar">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Istoriyalar
        </h2>
        {hasVideos ? (
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background transition hover:opacity-90 active:scale-[0.98]"
          >
            <Clapperboard className="size-3.5" strokeWidth={2} />
            Barcha videolar
          </Link>
        ) : null}
      </div>

      {stories.length ? (
        <ul className="mt-4 flex gap-3.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stories.map((story, index) => {
            const cover =
              story.avatarUrl ||
              story.items[0]?.thumbnailUrl ||
              (story.items[0]?.mediaType === "image"
                ? story.items[0].mediaUrl
                : undefined);

            return (
              <li key={story.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group flex w-[4.75rem] flex-col items-center gap-1.5 text-center"
                  aria-label={`${story.authorName} istoriyasi`}
                >
                  <span className="rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 p-[2.5px] transition group-active:scale-95">
                    <span className="flex size-[4.25rem] items-center justify-center overflow-hidden rounded-full bg-background p-[2px]">
                      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-muted">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">
                            {initials(story.authorName)}
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                  <span className="line-clamp-1 w-full text-[11px] font-medium text-foreground">
                    {story.authorName}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {activeIndex !== null && stories[activeIndex] ? (
        <StoryViewer
          stories={stories}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChangeIndex={setActiveIndex}
        />
      ) : null}
    </section>
  );
}

function StoryViewer({
  stories,
  startIndex,
  onClose,
  onChangeIndex,
}: {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}) {
  const story = stories[startIndex];
  const [itemIndex, setItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const elapsedRef = useRef(0);

  const item: StoryItem | undefined = story?.items[itemIndex];
  const quality = readVideoQuality();

  const goNext = useCallback(() => {
    if (!story) return;
    if (itemIndex < story.items.length - 1) {
      setItemIndex((i) => i + 1);
      setProgress(0);
      elapsedRef.current = 0;
      return;
    }
    if (startIndex < stories.length - 1) {
      onChangeIndex(startIndex + 1);
      setItemIndex(0);
      setProgress(0);
      elapsedRef.current = 0;
      return;
    }
    onClose();
  }, [story, itemIndex, startIndex, stories.length, onChangeIndex, onClose]);

  const goPrev = useCallback(() => {
    if (itemIndex > 0) {
      setItemIndex((i) => i - 1);
      setProgress(0);
      elapsedRef.current = 0;
      return;
    }
    if (startIndex > 0) {
      const prev = stories[startIndex - 1];
      onChangeIndex(startIndex - 1);
      setItemIndex(Math.max(0, (prev?.items.length ?? 1) - 1));
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [itemIndex, startIndex, stories, onChangeIndex]);

  // Reset when story group changes
  useEffect(() => {
    setItemIndex(0);
    setProgress(0);
    elapsedRef.current = 0;
  }, [startIndex]);

  // Image auto-advance
  useEffect(() => {
    if (!item || item.mediaType !== "image" || paused) return;

    const duration = item.durationMs || 5000;
    startedAtRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = elapsedRef.current + (now - startedAtRef.current);
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      elapsedRef.current += performance.now() - startedAtRef.current;
    };
  }, [item, paused, goNext, itemIndex, startIndex]);

  // Video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!item || item.mediaType !== "video" || !video) return;

    const onTime = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      setProgress(video.currentTime / video.duration);
    };
    const onEnded = () => goNext();

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    void video.play().catch(() => undefined);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
  }, [item, goNext, itemIndex, startIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goNext, goPrev]);

  if (!story || !item) return null;

  const videoSrc =
    item.mediaType === "video"
      ? resolveVideoSrc(
          { mediaUrl: item.mediaUrl, mediaUrlLow: item.mediaUrlLow },
          quality,
        )
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Istoriya"
    >
      <div className="relative flex h-[100dvh] w-full max-w-lg flex-col">
        {/* Progress */}
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {story.items.map((it, i) => (
            <div
              key={it.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/35"
            >
              <div
                className="h-full bg-white transition-[width] duration-75 ease-linear"
                style={{
                  width:
                    i < itemIndex
                      ? "100%"
                      : i === itemIndex
                        ? `${progress * 100}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2.5 px-3 pt-[calc(max(0.75rem,env(safe-area-inset-top))+0.85rem)]">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-1 ring-white/30">
            {story.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold text-white">
                {initials(story.authorName)}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white drop-shadow">
            {story.authorName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Yopish"
          >
            <X className="size-6" strokeWidth={2} />
          </button>
        </div>

        {/* Media */}
        <div className="relative flex-1 bg-black">
          {item.mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.mediaUrl}
              alt={item.caption || story.authorName}
              className="absolute inset-0 size-full object-contain"
            />
          ) : (
            <video
              key={videoSrc}
              ref={videoRef}
              src={videoSrc}
              className="absolute inset-0 size-full object-contain"
              playsInline
              autoPlay
              muted={false}
              controls={false}
              preload="auto"
              poster={item.thumbnailUrl}
            />
          )}

          {/* Tap zones */}
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-10 w-[32%]"
            aria-label="Oldingi"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerCancel={() => setPaused(false)}
            onClick={goPrev}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-10 w-[32%]"
            aria-label="Keyingi"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerCancel={() => setPaused(false)}
            onClick={goNext}
          />
        </div>

        {item.caption ? (
          <p
            className={cn(
              "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent",
              "px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 text-sm font-medium text-white",
            )}
          >
            {item.caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
