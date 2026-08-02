export type StoryMediaType = "image" | "video";

export type StoryItem = {
  id: string;
  mediaType: StoryMediaType;
  mediaUrl: string;
  mediaUrlLow?: string;
  thumbnailUrl?: string;
  durationMs: number;
  caption?: string;
};

export type Story = {
  id: string;
  authorName: string;
  avatarUrl?: string;
  items: StoryItem[];
  isActive: boolean;
  createdAt?: string;
};

export type StoryVideo = {
  id: string;
  storyId: string;
  authorName: string;
  avatarUrl?: string;
  mediaUrl: string;
  mediaUrlLow?: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt?: string;
};

export type VideoQuality = "auto" | "high" | "low";
