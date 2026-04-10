import StarRating from "@/components/ui/StarRating";

type TestimonialCardProps = {
  quote: string;
  name: string;
  location: string;
  rating: number;
  featured?: boolean;
};

export default function TestimonialCard({ quote, name, location, rating, featured = false }: TestimonialCardProps) {
  if (featured) {
    return (
      <div className="flex flex-col md:flex-row rounded-[10px] overflow-hidden shadow-sm border border-gray-200">
        {/* Light gray — quote */}
        <div className="flex-1 bg-[#f4f4f4] p-6 md:p-8">
          <span className="text-5xl text-black leading-none">&ldquo;</span>
          <p className="text-base md:text-xl lg:text-2xl text-black leading-snug mt-2">{quote}</p>
        </div>

        {/* Dark panel — rating, name, location */}
        <div className="w-full md:w-[280px] md:shrink-0 bg-brand-dark flex flex-row md:flex-col justify-between items-center md:items-stretch p-6 md:p-8">
          <StarRating rating={rating} size="lg" />
          <div className="text-right">
            <p className="text-brand-green text-lg md:text-xl font-semibold">{name}</p>
            <p className="text-brand-green text-sm mt-1 md:mt-6">{location}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-[10px] overflow-hidden shadow-sm border border-gray-200">
      {/* Light gray — quote */}
      <div className="flex-1 bg-[#f4f4f4] p-5">
        <span className="text-3xl text-black leading-none">&ldquo;</span>
        <p className="text-sm text-black leading-relaxed mt-1">{quote}</p>
      </div>

      {/* Dark strip — rating, name, location */}
      <div className="bg-brand-dark px-5 py-4">
        <StarRating rating={rating} size="sm" />
        <div className="flex justify-between items-end mt-2">
          <p className="text-brand-green text-sm font-semibold">{name}</p>
          <p className="text-brand-green text-xs">{location}</p>
        </div>
      </div>
    </div>
  );
}
