export const revalidate = 3600;

import TestimonialsClient from "./TestimonialsClient";
import { supabaseServer } from "@/lib/supabase-server";

export default async function TestimonialsPage() {
  const [testimonialsRes, locationsRes, contentRes] = await Promise.all([
    supabaseServer
      .from("testimonials")
      .select("id, content, rating, reviewer_name, location_id, locations(name), profiles(name, first_name, last_name)")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabaseServer.from("locations").select("id, name"),
    supabaseServer.from("site_content").select("value").eq("key", "hero_image_testimonials").single(),
  ]);

  type TestimonialRow = {
    id: string;
    content: string;
    rating: number;
    reviewer_name: string | null;
    location_id: string | null;
    profiles: { name: string | null; first_name: string | null; last_name: string | null } | null;
    locations: { name: string } | { name: string }[] | null;
  };

  const testimonials = ((testimonialsRes.data ?? []) as unknown as TestimonialRow[]).map((t) => {
    const profile = t.profiles;
    const displayName = profile
      ? (profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile.name ?? t.reviewer_name ?? "Anonymous")
      : t.reviewer_name ?? "Anonymous";

    const loc = Array.isArray(t.locations) ? t.locations[0] : t.locations;
    return {
      id:          t.id,
      quote:       t.content,
      name:        displayName,
      location:    loc?.name ?? "",
      location_id: t.location_id,
      rating:      t.rating,
    };
  });

  const locationOptions = (locationsRes.data ?? []).map((l) => ({ label: l.name, value: l.id }));

  return (
    <TestimonialsClient
      initialTestimonials={testimonials}
      locationOptions={locationOptions}
      heroImage={contentRes.data?.value ?? null}
    />
  );
}
