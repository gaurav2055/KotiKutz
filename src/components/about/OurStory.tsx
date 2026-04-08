type Props = { content?: string | null };

export default function OurStory({ content }: Props) {
  if (!content) return null;

  return (
    <section className="bg-offers-bg py-16">
      <div className="max-w-[1154px] mx-auto px-8">
        <h2 className="text-5xl font-bold text-black text-center mb-10">Our Story</h2>
        <div className="text-sm text-black leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </div>
    </section>
  );
}
