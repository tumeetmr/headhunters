"use client";

import { Recruiter } from "@/hooks/useRecruiter";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { useRef, useEffect, useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import { get } from "@/lib/api";

function RecruiterCard({
  recruiter,
  index,
}: {
  recruiter: Recruiter;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const expertiseTags = recruiter.tags
    .filter((tag) => tag.skill.type === "EXPERTISE")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3);

  const slug = recruiter.slug;
  const displayName = recruiter.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div
      ref={cardRef}
      className="opacity-0 translate-y-6 transition-all duration-350 ease-out"
      style={{
        ...(isVisible && {
          opacity: 1,
          transform: "translateY(0)",
          transitionDelay: `${index * 40}ms`,
        }),
      }}
    >
      <Link href={`/recruiters/${slug}`} className="group block h-full">
        <div className="relative h-full overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:group-hover:shadow-zinc-900/50">
          {/* Image */}
          <div className="relative aspect-4/5 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {recruiter.photoUrl ? (
              <Image
                src={recruiter.photoUrl}
                alt={displayName}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800">
                <span className="text-5xl font-bold text-zinc-300 dark:text-zinc-600 select-none">
                  {displayName.charAt(0)}
                </span>
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Arrow icon on hover */}
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-800 opacity-0 scale-75 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
              <ArrowUpRight className="h-4 w-4" />
            </div>

            {/* Location badge */}
            {recruiter.location && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-700 opacity-0 translate-y-2 backdrop-blur-sm transition-all duration-400 group-hover:opacity-100 group-hover:translate-y-0 dark:bg-zinc-900/90 dark:text-zinc-300">
                <MapPin className="h-3 w-3" />
                {recruiter.location}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-primary-text dark:text-zinc-50">
                  {displayName}
                </h3>
                <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {recruiter.title}
                </p>
              </div>
            </div>

            {expertiseTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expertiseTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 transition-colors duration-300 group-hover:bg-zinc-800 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-200 dark:group-hover:text-zinc-800"
                  >
                    {tag.skill.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
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

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-4/5 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-4 h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
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

  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-3 ${columns}`}>
      {recruiters.map((recruiter, index) => (
        <RecruiterCard key={recruiter.id} recruiter={recruiter} index={index} />
      ))}
    </div>
  );
}
