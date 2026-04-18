import ServicesClient from "./ServicesClient";
import { supabaseServer } from "@/lib/supabase-server";

export type FiltersState = {
  search: string;
  locationId: string;
  gender: string;
  categories: string[];
};

export default async function ServicesPage() {
  const [servicesRes, contentRes, locationsRes] = await Promise.all([
    supabaseServer.from("services").select("id, name, price, category, gender, description, image_url"),
    supabaseServer.from("site_content").select("value").eq("key", "hero_image_services").single(),
    supabaseServer.from("locations").select("id, name").order("name"),
  ]);

  const locationOptions = (locationsRes.data ?? []).map((l) => ({ label: l.name, value: l.id }));

  return (
    <ServicesClient
      initialServices={servicesRes.data ?? []}
      heroImage={contentRes.data?.value ?? null}
      locationOptions={locationOptions}
    />
  );
}
