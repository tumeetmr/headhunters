"use client";

import { useLanguage } from "@/providers/language-provider";
import type { TranslationKey } from "@/lib/i18n";

const cards: {
  number: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}[] = [
  {
    number: "01",
    titleKey: "whyLambda.card1.title",
    descriptionKey: "whyLambda.card1.description",
  },
  {
    number: "02",
    titleKey: "whyLambda.card2.title",
    descriptionKey: "whyLambda.card2.description",
  },
  {
    number: "03",
    titleKey: "whyLambda.card3.title",
    descriptionKey: "whyLambda.card3.description",
  },
];

export default function WhyLambda() {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary-text dark:text-zinc-50 sm:text-4xl md:text-5xl">
            {t("whyLambda.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
            {t("whyLambda.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.number}
              className="rounded-[2rem] bg-linear-to-b from-[#364152] to-[#5a6878] p-7 text-white shadow-[0_20px_60px_rgba(33,43,54,0.12)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-sm font-medium text-white/70">
                {card.number}
              </div>
              <h3 className="mt-8 whitespace-pre-line text-3xl font-bold leading-[1.3] tracking-tight text-white">
                {t(card.titleKey)}
              </h3>
              <p className="mt-6 max-w-sm text-base leading-8 text-white/68">
                {t(card.descriptionKey)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
