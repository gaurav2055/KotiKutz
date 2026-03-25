type StarRatingProps = {
  rating: number; // out of 5
  size?: "sm" | "lg";
};

export default function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const starSize = size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <div className={`flex gap-1 ${starSize}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? "#FFB800" : "#555" }}>
          ★
        </span>
      ))}
    </div>
  );
}
