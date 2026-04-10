"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import AdminSelect from "@/components/ui/AdminSelect";
import { supabase } from "@/lib/supabase";

type Props = {
  userId: string;
  reviewerName: string;
  onClose: () => void;
  onSubmitted: () => void;
};

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-4xl transition-colors"
          style={{ color: star <= (hovered || value) ? "#FFB800" : "#555" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewModal({ userId, reviewerName, onClose, onSubmitted }: Props) {
  const [locationOptions, setLocationOptions] = useState<{ label: string; value: string }[]>([]);
  const [locationId, setLocationId] = useState("");
  const [rating, setRating]         = useState(0);
  const [content, setContent]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name")
      .then(({ data }) => {
        if (data) setLocationOptions(data.map((l) => ({ label: l.name, value: l.id })));
      });
  }, []);

  const canSubmit = locationId !== "" && rating > 0 && content.trim() !== "" && !loading;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        locationId,
        reviewerName,
        content: content.trim(),
        rating,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }
    setLoading(false);
    onSubmitted();
    onClose();
  }

  return (
    <Modal theme="light" width="w-[480px]" onClose={onClose}>
      <h2 className="text-xl font-bold text-black mb-1">Write a Review</h2>
      <p className="text-sm text-gray-500 mb-6">Share your experience at KotiKutz</p>

      <div className="space-y-5">
        {/* Location */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Location visited</label>
          <AdminSelect
            value={locationId}
            onChange={setLocationId}
            options={locationOptions}
            placeholder="Choose Location"
            variant="light"
            className="w-full"
          />
        </div>

        {/* Star rating */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Your rating</label>
          <StarSelector value={rating} onChange={setRating} />
        </div>

        {/* Review text */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Your review</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell others about your experience…"
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-brand-green transition-colors resize-none"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-5 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-5 py-2 text-sm rounded-full bg-brand-green text-black font-semibold hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </Modal>
  );
}
