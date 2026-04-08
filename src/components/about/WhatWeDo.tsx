type Props = { content?: string | null };

export default function WhatWeDo({ content }: Props) {
  if (!content) return null;

  return (
    <section className="py-16 max-w-[1440px] mx-auto px-16">
      <h2 className="text-5xl font-bold text-black text-center mb-10">What We Do</h2>
      <div className="text-sm text-black leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </section>
  );
}
