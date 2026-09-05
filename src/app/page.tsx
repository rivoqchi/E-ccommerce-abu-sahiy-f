import { HomeGreeting } from "@/components/home/HomeGreeting";
import { HomeSearch } from "@/components/home/HomeSearch";
import { HomeStories } from "@/components/home/HomeStories";
import { HomeCategoryPills } from "@/components/home/HomeCategoryPills";
import { HomeSellers } from "@/components/home/HomeSellers";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HOME_PRODUCTS_PAGE_SIZE } from "@/lib/catalog";
import {
  fetchCategories,
  fetchProducts,
  fetchSellers,
  fetchStories,
  fetchStoryVideos,
} from "@/lib/storefront-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [productsResult, categories, sellers, stories, videos] =
    await Promise.all([
      fetchProducts({ page: 1, limit: HOME_PRODUCTS_PAGE_SIZE, newOnly: true }),
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

        <div className="w-full">
          <HomeSearch />
        </div>

        <HomeStories stories={stories} hasVideos={videos.length > 0} />
        <HomeCategoryPills categories={categories} />
        <FeaturedProducts
          initialProducts={productsResult.items}
          total={productsResult.total}
          initialPage={productsResult.page}
        />
        <HomeSellers sellers={sellers} />
      </div>
    </div>
  );
}
