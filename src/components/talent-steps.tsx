"use client";

export type TalentStepItem = {
  title: string;
  time?: string;
};

type TalentStepsProps = {
  items: TalentStepItem[];
  activeIndex?: number;
  className?: string;
};

export default function TalentSteps({
  items,
  activeIndex = 0,
  className,
}: TalentStepsProps) {
  const safeActiveIndex = Math.max(0, Math.min(activeIndex, Math.max(items.length - 1, 0)));

  return (
    <div className={className}>
      <div className="relative mx-auto max-w-5xl">
        <div
          className="grid grid-cols-1 gap-10 sm:gap-0"
          style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
        >
          {items.map((step, i) => (
            <div key={`${step.title}-${i}`} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <div
                  className={`absolute top-3 right-1/2 left-0 hidden h-px sm:block ${
                    i <= safeActiveIndex ? "bg-primary-text dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              )}
              {i < items.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 right-0 hidden h-px sm:block ${
                    i < safeActiveIndex ? "bg-primary-text dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              )}
              <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    i <= safeActiveIndex ? "bg-primary-text dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              </div>
              <h3 className="mt-4 text-sm font-bold text-primary-text dark:text-zinc-100 sm:text-base">
                {step.title}
              </h3>
              {step.time && (
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {step.time}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
