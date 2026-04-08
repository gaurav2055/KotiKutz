"use client";

import { useEffect, useState } from "react";
import AboutHero  from "@/components/about/AboutHero";
import OurStory   from "@/components/about/OurStory";
import TeamSlider from "@/components/about/TeamSlider";
import WhatWeDo   from "@/components/about/WhatWeDo";
import { supabase } from "@/lib/supabase";

type Content = Record<string, string | null>;

const KEYS = ["about_hero_tagline", "about_hero_image", "about_story", "about_what_we_do"];

export default function AboutPage() {
  const [content, setContent] = useState<Content>({});

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, value")
      .in("key", KEYS)
      .then(({ data }) => {
        if (data) setContent(Object.fromEntries(data.map((r) => [r.key, r.value])));
      });
  }, []);

  return (
    <main>
      <AboutHero
        tagline={content.about_hero_tagline}
        image={content.about_hero_image}
      />
      <OurStory   content={content.about_story} />
      <TeamSlider />
      <WhatWeDo   content={content.about_what_we_do} />
    </main>
  );
}
