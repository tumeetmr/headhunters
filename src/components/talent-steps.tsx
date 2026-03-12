"use client";

import { useLanguage } from "@/providers/language-provider";
import type { TranslationKey } from "@/lib/i18n";

const steps: { titleKey: TranslationKey; timeKey: TranslationKey }[] = [
  { titleKey: "steps.step1.title", timeKey: "steps.step1.time" },
  { titleKey: "steps.step2.title", timeKey: "steps.step2.time" },
  { titleKey: "steps.step3.title", timeKey: "steps.step3.time" },
  { titleKey: "steps.step4.title", timeKey: "steps.step4.time" },
];

export default function TalentSteps() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 dark:bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary-text dark:text-zinc-50 sm:text-4xl md:text-5xl">
            {t("steps.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
            {t("steps.subtitle")}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-0">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* Left half-line */}
                {i > 0 && (
                  <div
                    className={`absolute top-3 right-1/2 left-0 hidden h-px sm:block ${
                      i === 1 ? "bg-primary-text dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  />
                )}
                {/* Right half-line */}
                {i < steps.length - 1 && (
                  <div
                    className={`absolute top-3 left-1/2 right-0 hidden h-px sm:block ${
                      i === 0 ? "bg-primary-text dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  />
                )}
                {/* Dot */}
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      i === 0
                        ? "bg-primary-text dark:bg-zinc-100"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  />
                </div>
                {/* Label */}
                <h3 className="mt-4 text-sm font-bold text-primary-text dark:text-zinc-100 sm:text-base">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {t(step.timeKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
