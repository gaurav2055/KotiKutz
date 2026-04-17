"use client";

import { useEffect, useState, useMemo } from "react";
import SiteHero from "@/components/SiteHero";
import AdminSelect from "@/components/ui/AdminSelect";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import WriteReviewModal from "@/components/testimonials/WriteReviewModal";
import Spinner from "@/components/ui/Spinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  location: string;
  location_id: string | null;
  rating: number;
};

export default function TestimonialsPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials]   = useState<Testimonial[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ label: string; value: string }[]>([]);
  const [location, setLocation]           = useState("");
  const [loading, setLoading]             = useState(true);
  const [heroImage, setHeroImage]         = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  function fetchTestimonials() {
    supabase
      .from("testimonials")
      .select("id, content, rating, reviewer_name, location_id, locations(name), profiles(name, first_name, last_name)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          type TestimonialRow = { id: string; content: string; rating: number; reviewer_name: string | null; location_id: string | null; profiles: { name: string | null; first_name: string | null; last_name: string | null } | null; locations: { name: string } | { name: string }[] | null };
          setTestimonials((data as unknown as TestimonialRow[]).map((t) => {
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
          }));
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchTestimonials();
    supabase
      .from("locations")
      .select("id, name")
      .then(({ data }) => {
        if (data) setLocationOptions(data.map((l) => ({ label: l.name, value: l.id })));
      });
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "hero_image_testimonials")
      .single()
      .then(({ data }) => { if (data?.value) setHeroImage(data.value); });
  }, []);

  const filtered = useMemo(() =>
    location ? testimonials.filter((t) => t.location_id === location) : testimonials,
    [location, testimonials]
  );

  const [featured, ...rest] = filtered;

  const reviewerName = user
    ? (user.user_metadata?.full_name ?? user.email ?? "Anonymous")
    : "";

  return (
    <main>
      <SiteHero title="Testimonials" heroImage={heroImage} />

      <div className="max-w-[1229px] mx-auto px-8 py-10">

        {/* Top bar — write review button above dropdown on mobile, side by side on sm+ */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <AdminSelect
            value={location}
            onChange={setLocation}
            options={locationOptions}
            placeholder="All Locations"
            variant="light"
            className="w-full sm:w-[219px]"
          />
          {user && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="bg-brand-dark text-white px-5 py-2.5 rounded-[10px] text-sm font-medium hover:opacity-80 transition-opacity w-full sm:w-auto"
            >
              + Write a Review
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" label="Loading reviews…" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No reviews yet for this location.</p>
        ) : (
          <>
            {featured && (
              <div className="mb-8">
                <TestimonialCard {...featured} featured />
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((t) => (
                  <TestimonialCard key={t.id} {...t} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {reviewModalOpen && user && (
        <WriteReviewModal
          userId={user.id}
          reviewerName={reviewerName}
          onClose={() => setReviewModalOpen(false)}
          onSubmitted={fetchTestimonials}
        />
      )}
    </main>
  );
}
