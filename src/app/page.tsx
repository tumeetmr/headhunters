"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecruiterList from "@/components/recruiter-list";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import TalentSteps from "@/components/talent-steps";
import WhyLambda from "@/components/why-lambda";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
    <div className="flex min-h-[calc(100vh-20vh)] flex-col items-center justify-center bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-primary-text dark:text-zinc-50 sm:text-5xl md:text-6xl">
          {t("hero.title.1")}
          <br />
          {t("hero.title.2")}<span className="bg-linear-to-r from-[#36CCC7] via-[#36CCC7] to-[#34E89E] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #36CCC7 45.93%, #34E89E 72.8%)" }}>{t("hero.title.highlight")}</span>{t("hero.title.3")}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
          {t("hero.description")}
        </p>
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
          <Button variant="gradient" size="lg" className="h-14 w-full rounded-xl px-8 text-base font-semibold sm:w-auto" asChild>
            <Link href="/get-started">{t("hero.cta")}</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 w-full rounded-xl px-8 text-base font-medium text-primary-text sm:w-auto" asChild>
            <Link href="/learn-more">
              {t("hero.learn")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      </div>
    </div>
    <RecruiterList />
    <TalentSteps />
    <WhyLambda />
    </>
  );
}
