import type { Metadata } from "next";
import { VideosFeed } from "@/components/videos/VideosFeed";
import { fetchStoryVideos } from "@/lib/storefront-api";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Videolar",
  description: "Mahsulot va doʻkon videolari — Instagram Reels uslubida",
  alternates: { canonical: "/videos" },
};

export default async function VideosPage() {
  const videos = await fetchStoryVideos();
  return <VideosFeed videos={videos} />;
}
