"use client";

import { Recruiter } from "@/hooks/useRecruiter";
import { useLanguage } from "@/providers/language-provider";
import { useEffect, useMemo, useState } from "react";
import { get } from "@/lib/api";
import {
  Card as CarouselCard,
  Carousel,
  CarouselCardData,
} from "@/components/ui/cards-carousel";
import { MapPin } from "lucide-react";

const recruiterAccentStyles = [
  "bg-linear-to-br from-rose-500/30 via-orange-500/15 to-rose-900/30",
  "bg-linear-to-br from-sky-500/30 via-cyan-500/10 to-slate-900/35",
  "bg-linear-to-br from-violet-500/30 via-fuchsia-500/10 to-slate-900/35",
  "bg-linear-to-br from-emerald-500/30 via-teal-500/10 to-slate-900/35",
  "bg-linear-to-br from-amber-500/30 via-rose-500/10 to-slate-900/35",
];

function recruiterDisplayName(recruiter: Recruiter) {
  if (recruiter.user?.name) return recruiter.user.name;
  return recruiter.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function recruiterExpertise(recruiter: Recruiter, limit = 5) {
  return recruiter.tags
    .filter((tag) => tag.skill.type === "EXPERTISE")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((tag) => tag.skill.value);
}

function RecruiterModalContent({
  recruiter,
}: {
  recruiter: Recruiter;
}) {
  const expertiseTags = recruiterExpertise(recruiter, 8);

  return (
    <div className="space-y-6">
      {recruiter.location ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          <MapPin className="h-4 w-4" />
          {recruiter.location}
        </div>
      ) : null}

      <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {recruiter.tagline || recruiter.bio}
      </p>

      {expertiseTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {expertiseTags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">Experience</p>
          <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
            {recruiter.yearsExperience
              ? `${recruiter.yearsExperience}+ years`
              : "Not specified"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">Rating</p>
          <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
            {Number.isFinite(recruiter.rating)
              ? recruiter.rating.toFixed(1)
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterList({
  isLeadPartner,
  limit,
  columns = "lg:grid-cols-3",
}: {
  isLeadPartner?: boolean;
  limit?: number;
  columns?: string;
} = {}) {
  const { t } = useLanguage();
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const skeletonCount = columns.includes("4") ? 8 : 6;

  useEffect(() => {
    const fetchRecruiters = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("visibility", "PUBLISHED");
        if (isLeadPartner !== undefined) {
          params.append("isLeadPartner", String(isLeadPartner));
        }

        const response = await get(`/recruiters?${params.toString()}`);
        let data = Array.isArray(response) ? response : [];
        
        if (limit) {
          data = data.slice(0, limit);
        }
        
        setRecruiters(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch recruiters:", err);
        setError(err instanceof Error ? err.message : "Failed to load recruiters");
        setRecruiters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, [isLeadPartner, limit]);

  const items = useMemo(() => {
    return recruiters.map((recruiter, index) => {
      const displayName = recruiterDisplayName(recruiter);
      const expertise = recruiterExpertise(recruiter, 5);
      const cardData: CarouselCardData = {
        src: recruiter.photoUrl || "/image/lambda.png",
        title: recruiter.title || displayName,
        subtitle: displayName,
        category: recruiter.yearsExperience
          ? `${recruiter.yearsExperience}+ years experience`
          : recruiter.location || "Featured recruiter",
        tags: expertise,
        footer: recruiter.location || "Available for new searches",
        overlayClassName:
          recruiterAccentStyles[index % recruiterAccentStyles.length],
        href: `/recruiters/${recruiter.slug}`,
        ctaLabel: "View profile",
        content: <RecruiterModalContent recruiter={recruiter} />,
      };

      return <CarouselCard key={recruiter.id} card={cardData} index={index} />;
    });
  }, [recruiters, t]);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="h-108 w-[78vw] max-w-68 shrink-0 animate-pulse rounded-3xl bg-zinc-100 sm:h-128 sm:w-72 sm:max-w-none md:h-160 md:w-96 dark:bg-zinc-800"
            >
              <div className="h-full w-full rounded-3xl bg-linear-to-b from-zinc-300/40 via-zinc-200/20 to-zinc-100/30 dark:from-zinc-700/50 dark:via-zinc-800/40 dark:to-zinc-900/50" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-zinc-500">{t("recruiters.error")}</p>
      </section>
    );
  }

  return <Carousel items={items} />;
}
