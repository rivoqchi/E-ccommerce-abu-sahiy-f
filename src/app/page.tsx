import { HomeGreeting } from "@/components/home/HomeGreeting";
import { HomeSearch } from "@/components/home/HomeSearch";
import { HomeStories } from "@/components/home/HomeStories";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HomeCategoryPills } from "@/components/home/HomeCategoryPills";
import { HomeSellers } from "@/components/home/HomeSellers";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchSellers,
  fetchStories,
  fetchStoryVideos,
} from "@/lib/storefront-api";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories, sellers, stories, videos] = await Promise.all([
    fetchFeaturedProducts(8),
    fetchCategories(),
    fetchSellers(),
    fetchStories(),
    fetchStoryVideos(),
  ]);

  return (
    <div className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10">
      <div className="space-y-5 md:space-y-8">
        <div className="md:hidden">
          <HomeGreeting />
        </div>

        <div className="hidden items-end justify-between gap-6 md:flex">
          <div>
            <p className="text-sm text-muted-foreground">
              Samiga xush kelibsiz
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Kundalik xaridingizning ishonchli hamrohi
            </h1>
          </div>
          <div className="w-full max-w-md">
            <HomeSearch />
          </div>
        </div>

        <div className="md:hidden">
          <HomeSearch />
        </div>

        <HomeStories stories={stories} hasVideos={videos.length > 0} />
        <PromoBanner />
        <HomeSellers sellers={sellers} />
        <HomeCategoryPills categories={categories} />
        <FeaturedProducts products={featured} />
      </div>
    </div>
  );
}
