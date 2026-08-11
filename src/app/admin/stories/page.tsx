"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Film, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { useAdminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type ApiStoryItem = {
  _id?: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  mediaUrlLow?: string;
  thumbnailUrl?: string;
  durationMs?: number;
  caption?: string;
};

type ApiStory = {
  _id: string;
  authorName: string;
  avatarUrl?: string;
  items: ApiStoryItem[];
  isActive: boolean;
  createdAt?: string;
};

type DraftItem = {
  key: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  mediaUrlLow: string;
  thumbnailUrl: string;
  caption: string;
  durationMs: number;
  uploading?: boolean;
};

const emptyDraft = (): DraftItem => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  mediaType: "image",
  mediaUrl: "",
  mediaUrlLow: "",
  thumbnailUrl: "",
  caption: "",
  durationMs: 5000,
});

function storyToDrafts(story: ApiStory): DraftItem[] {
  if (!story.items?.length) return [emptyDraft()];
  return story.items.map((item, i) => ({
    key: item._id ?? `edit-${i}-${item.mediaUrl}`,
    mediaType: item.mediaType,
    mediaUrl: item.mediaUrl,
    mediaUrlLow: item.mediaUrlLow ?? "",
    thumbnailUrl: item.thumbnailUrl ?? "",
    caption: item.caption ?? "",
    durationMs: item.durationMs ?? 5000,
  }));
}

export default function AdminStoriesPage() {
  const { adminFetch } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const lowFileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ApiStory[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [drafts, setDrafts] = useState<DraftItem[]>([emptyDraft()]);
  const [activeDraftKey, setActiveDraftKey] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<"main" | "low">("main");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const load = useCallback(async () => {
    setItems(await adminFetch<ApiStory[]>("/stories?all=true"));
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  async function uploadMedia(file: File) {
    const form = new FormData();
    form.append("file", file);
    return adminFetch<{
      url: string;
      mediaType: "image" | "video";
      size: number;
    }>("/uploads/media", { method: "POST", body: form });
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const res = await uploadMedia(file);
      setAvatarUrl(res.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Avatar yuklanmadi");
    } finally {
      setUploadingAvatar(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  }

  async function onPickMedia(file: File | null) {
    if (!file || !activeDraftKey) return;
    setError(null);
    setDrafts((prev) =>
      prev.map((d) =>
        d.key === activeDraftKey ? { ...d, uploading: true } : d,
      ),
    );
    try {
      const res = await uploadMedia(file);
      setDrafts((prev) =>
        prev.map((d) => {
          if (d.key !== activeDraftKey) return d;
          if (uploadTarget === "low") {
            return { ...d, mediaUrlLow: res.url, uploading: false };
          }
          return {
            ...d,
            mediaType: res.mediaType,
            mediaUrl: res.url,
            uploading: false,
            thumbnailUrl:
              res.mediaType === "image" ? res.url : d.thumbnailUrl,
          };
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fayl yuklanmadi");
      setDrafts((prev) =>
        prev.map((d) =>
          d.key === activeDraftKey ? { ...d, uploading: false } : d,
        ),
      );
    }
  }

  function resetForm() {
    setEditingId(null);
    setAuthorName("");
    setAvatarUrl("");
    setIsActive(true);
    setDrafts([emptyDraft()]);
    setActiveDraftKey(null);
    setError(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(story: ApiStory) {
    setEditingId(story._id);
    setAuthorName(story.authorName);
    setAvatarUrl(story.avatarUrl ?? "");
    setIsActive(story.isActive);
    setDrafts(storyToDrafts(story));
    setActiveDraftKey(null);
    setError(null);
    setOpen(true);
  }

  function handleDialogChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function buildPayload() {
    const ready = drafts.filter((d) => d.mediaUrl);
    return {
      authorName: authorName.trim(),
      avatarUrl: avatarUrl || undefined,
      items: ready.map((d) => ({
        mediaType: d.mediaType,
        mediaUrl: d.mediaUrl,
        mediaUrlLow: d.mediaUrlLow || undefined,
        thumbnailUrl: d.thumbnailUrl || undefined,
        caption: d.caption.trim() || undefined,
        durationMs: d.mediaType === "image" ? d.durationMs : undefined,
      })),
      isActive,
    };
  }

  function save() {
    setError(null);
    const payload = buildPayload();
    if (!payload.authorName) {
      setError("Muallif nomi kerak");
      return;
    }
    if (!payload.items.length) {
      setError("Kamida bitta media yuklang");
      return;
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await adminFetch(`/stories/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/stories", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        setOpen(false);
        resetForm();
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Saqlanmadi");
      }
    });
  }

  async function remove(id: string) {
    const prev = items;
    setItems((list) => list.filter((s) => s._id !== id));
    setError(null);
    try {
      await adminFetch(`/stories/${id}`, { method: "DELETE" });
    } catch (e) {
      setItems(prev);
      setError(e instanceof Error ? e.message : "Oʻchirilmadi");
      throw e;
    }
  }

  async function toggleActive(story: ApiStory) {
    const next = !story.isActive;
    setItems((list) =>
      list.map((s) => (s._id === story._id ? { ...s, isActive: next } : s)),
    );
    try {
      await adminFetch(`/stories/${story._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: next }),
      });
    } catch (e) {
      setItems((list) =>
        list.map((s) =>
          s._id === story._id ? { ...s, isActive: story.isActive } : s,
        ),
      );
      setError(e instanceof Error ? e.message : "Holat yangilanmadi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Istoriyalar</h1>
        </div>
        <Button className="rounded-full" onClick={openCreate}>
          <Plus className="size-4" />
          Qoʻshish
        </Button>
      </div>

      {error && !open ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="overflow-hidden border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Muallif</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((story) => {
                const videoCount = story.items.filter(
                  (i) => i.mediaType === "video",
                ).length;
                const cover =
                  story.avatarUrl ||
                  story.items[0]?.thumbnailUrl ||
                  story.items[0]?.mediaUrl;
                return (
                  <TableRow key={story._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="relative size-10 overflow-hidden rounded-full bg-muted">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </span>
                        <div>
                          <p className="font-medium">{story.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {story.items.length} ta slide
                            {videoCount ? ` · ${videoCount} video` : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {story.items.slice(0, 4).map((it, i) => (
                          <Badge
                            key={it._id ?? i}
                            variant="secondary"
                            className="gap-1"
                          >
                            {it.mediaType === "video" ? (
                              <Film className="size-3" />
                            ) : (
                              <ImagePlus className="size-3" />
                            )}
                            {it.mediaType}
                          </Badge>
                        ))}
                        {story.items.length > 4 ? (
                          <Badge variant="outline">
                            +{story.items.length - 4}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => void toggleActive(story)}
                      >
                        <Badge
                          variant={story.isActive ? "default" : "outline"}
                        >
                          {story.isActive ? "Faol" : "Yashirin"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => openEdit(story)}
                      >
                        Tahrir
                      </Button>
                      <ConfirmAction
                        title="Istoriyani oʻchirish?"
                        description={`“${story.authorName}” istoriyasi oʻchiriladi. Bu amalni qaytarib boʻlmaydi.`}
                        className="text-destructive"
                        onConfirm={() => remove(story._id)}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmAction>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Hali istoriya yoʻq
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Istoriyani tahrirlash" : "Yangi istoriya"}
            </DialogTitle>
          </DialogHeader>

          {error ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Muallif nomi</label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Masalan: Sami"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar (ixtiyoriy)</label>
              <div className="flex items-center gap-3">
                <span className="size-14 overflow-hidden rounded-full bg-muted">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={() => avatarRef.current?.click()}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Yuklash
                </Button>
                {avatarUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setAvatarUrl("")}
                  >
                    Olib tashlash
                  </Button>
                ) : null}
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    void onPickAvatar(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border"
              />
              Faol istoriya
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Slaydlar</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrafts((d) => [...d, emptyDraft()])}
                >
                  <Plus className="size-4" />
                  Slayd
                </Button>
              </div>

              {drafts.map((draft, idx) => (
                <div
                  key={draft.key}
                  className="space-y-2 rounded-2xl border border-border/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      #{idx + 1} · {draft.mediaType || "media"}
                    </p>
                    {drafts.length > 1 ? (
                      <button
                        type="button"
                        className="text-xs text-destructive"
                        onClick={() =>
                          setDrafts((prev) =>
                            prev.filter((d) => d.key !== draft.key),
                          )
                        }
                      >
                        Oʻchirish
                      </button>
                    ) : null}
                  </div>

                  {draft.mediaUrl ? (
                    <div className="overflow-hidden rounded-xl bg-muted">
                      {draft.mediaType === "video" ? (
                        <video
                          src={draft.mediaUrl}
                          className="max-h-40 w-full object-contain"
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={draft.mediaUrl}
                          alt=""
                          className="max-h-40 w-full object-contain"
                        />
                      )}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={draft.uploading}
                      onClick={() => {
                        setActiveDraftKey(draft.key);
                        setUploadTarget("main");
                        fileRef.current?.click();
                      }}
                    >
                      {draft.uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      {draft.mediaUrl ? "Media almashtirish" : "Asosiy media"}
                    </Button>
                    {draft.mediaType === "video" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={draft.uploading}
                        onClick={() => {
                          setActiveDraftKey(draft.key);
                          setUploadTarget("low");
                          lowFileRef.current?.click();
                        }}
                      >
                        Tejamkor video
                      </Button>
                    ) : null}
                  </div>

                  {!draft.mediaUrl ? (
                    <p className="text-xs text-muted-foreground">
                      Rasm yoki video (mp4/webm, max 200MB)
                    </p>
                  ) : null}

                  {draft.mediaUrlLow ? (
                    <p
                      className={cn(
                        "truncate text-xs text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      Low: {draft.mediaUrlLow}
                    </p>
                  ) : null}

                  <Input
                    value={draft.caption}
                    onChange={(e) =>
                      setDrafts((prev) =>
                        prev.map((d) =>
                          d.key === draft.key
                            ? { ...d, caption: e.target.value }
                            : d,
                        ),
                      )
                    }
                    placeholder="Izoh (ixtiyoriy)"
                  />

                  {draft.mediaType === "image" ? (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">
                        Davomiylik (ms)
                      </label>
                      <Input
                        type="number"
                        min={1000}
                        max={30000}
                        step={500}
                        className="h-8 w-28"
                        value={draft.durationMs}
                        onChange={(e) =>
                          setDrafts((prev) =>
                            prev.map((d) =>
                              d.key === draft.key
                                ? {
                                    ...d,
                                    durationMs:
                                      Number(e.target.value) || 5000,
                                  }
                                : d,
                            ),
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              void onPickMedia(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <input
            ref={lowFileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              void onPickMedia(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogChange(false)}
            >
              Bekor
            </Button>
            <Button disabled={pending} onClick={save}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Saqlash"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
