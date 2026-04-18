import SiteHero            from "@/components/SiteHero";
import OffersSection       from "@/components/home/OffersSection";
import LocationsSection    from "@/components/home/LocationsSection";
import PopularServicesSection from "@/components/home/PopularServicesSection";
import { supabaseServer }  from "@/lib/supabase-server";

export default async function HomePage() {
  const [contentRes, offersRes, locationsRes, servicesRes] = await Promise.all([
    supabaseServer.from("site_content").select("key, value").in("key", ["hero_image_home", "home_locations_description"]),
    supabaseServer.from("offers").select("id, title, description, bullet_points, image_url").eq("active", true).order("sort_order"),
    supabaseServer.from("locations").select("id, name, address, image_url"),
    supabaseServer.from("services").select("id, name, price, description, image_url").limit(10),
  ]);

  const content: Record<string, string> = {};
  contentRes.data?.forEach((r) => { content[r.key] = r.value; });

  return (
    <main>
      <SiteHero heroImage={content.hero_image_home ?? null} />
      <OffersSection offers={offersRes.data ?? []} />
      <LocationsSection locations={locationsRes.data ?? []} description={content.home_locations_description ?? null} />
      <PopularServicesSection services={servicesRes.data ?? []} />
    </main>
  );
}
