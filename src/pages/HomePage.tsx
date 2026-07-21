import { HeroSection } from "@/components/home/HeroSection";
import { SloganTicker } from "@/components/home/SloganTicker";
import { FeaturedVideos } from "@/components/home/FeaturedVideos";
import { CategorySection } from "@/components/home/CategorySection";
import { CitiesMap } from "@/components/home/CitiesMap";
import { VIDEOS, CATEGORIES, type VideoCategory } from "@/data/videos";

export function HomePage() {
  // group videos by category once
  const byCategory = CATEGORIES.reduce<Record<VideoCategory, typeof VIDEOS>>(
    (acc, c) => {
      acc[c.id] = VIDEOS.filter((v) => v.category === c.id);
      return acc;
    },
    {} as Record<VideoCategory, typeof VIDEOS>
  );
  return (
    <>
      <HeroSection />
      <SloganTicker />
      <FeaturedVideos videos={VIDEOS} />
      {CATEGORIES.map((c) => (
        <CategorySection key={c.id} category={c.id} videos={byCategory[c.id]} />
      ))}
      <CitiesMap />
      <CTASection />
    </>
  );
}

function CTASection() {
  return (
    <section className="border-b-3 border-ink bg-saffron py-14">
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">
          Got a reel the world should see?
        </h2>
        <p className="mt-3 text-ink/80">
          If you filmed something peaceful and public, submit the URL. We'll
          add it to the archive and the next person scrolling will see it.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="#submit" className="nb-btn bg-ink text-paper">
            Submit a Reel
          </a>
          <a href="/videos" className="nb-btn bg-white">
            Browse the Archive
          </a>
        </div>
      </div>
    </section>
  );
}