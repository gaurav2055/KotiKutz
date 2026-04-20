export const revalidate = 3600;

import AboutHero  from "@/components/about/AboutHero";
import OurStory   from "@/components/about/OurStory";
import TeamSlider from "@/components/about/TeamSlider";
import WhatWeDo   from "@/components/about/WhatWeDo";
import { supabaseServer } from "@/lib/supabase-server";
import type { StaffMember } from "@/components/about/TeamSlider";

const CONTENT_KEYS = ["about_hero_tagline", "about_hero_image", "about_story", "about_what_we_do"];

export default async function AboutPage() {
  const [contentRes, staffRes] = await Promise.all([
    supabaseServer.from("site_content").select("key, value").in("key", CONTENT_KEYS),
    supabaseServer.from("staff").select("id, specialization, profiles!staff_id_fkey(name, first_name, last_name, avatar_url), locations(name)"),
  ]);

  const content: Record<string, string | null> = {};
  contentRes.data?.forEach((r) => { content[r.key] = r.value; });

  return (
    <main>
      <AboutHero
        tagline={content.about_hero_tagline}
        image={content.about_hero_image}
      />
      <OurStory   content={content.about_story} />
      <TeamSlider members={(staffRes.data ?? []) as unknown as StaffMember[]} />
      <WhatWeDo   content={content.about_what_we_do} />
    </main>
  );
}
