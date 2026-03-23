'use client';

import { useEffect, useState } from 'react';
import {
  BrainCircuit,
  ClipboardCheck,
  Globe,
  Star,
} from 'lucide-react';
import { get } from '@/lib/api';

interface InsightData {
  icon: 'star' | 'clipboard' | 'globe' | 'brain';
  value: string;
  label: string;
}

interface RecruiterInsightSource {
  rating?: number;
  location?: string | null;
  tags?: Array<{ skill?: { value?: string } }>;
  activeSearches?: unknown[];
}

const iconMap = {
  star: Star,
  clipboard: ClipboardCheck,
  globe: Globe,
  brain: BrainCircuit,
};

export default function Insights() {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const recruiters = await get<RecruiterInsightSource[]>('/recruiters?visibility=PUBLISHED');
        const publishedRecruiters = Array.isArray(recruiters) ? recruiters : [];

        if (publishedRecruiters.length === 0) {
          setInsights([
            {
              icon: 'star',
              value: '4.9',
              label: 'Avg. client ratings in Development & IT',
            },
            {
              icon: 'clipboard',
              value: '211k+',
              label: 'Projects completed',
            },
            {
              icon: 'globe',
              value: '140+',
              label: 'Countries available',
            },
            {
              icon: 'brain',
              value: '1,665',
              label: 'Skills and specialties',
            },
          ]);
          return;
        }

        const ratedRecruiters = publishedRecruiters.filter(
          (item) => typeof item.rating === 'number' && item.rating > 0
        );
        const avgRating = ratedRecruiters.length
          ? ratedRecruiters.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
            ratedRecruiters.length
          : 0;

        const totalActiveSearches = publishedRecruiters.reduce(
          (sum, item) => sum + (item.activeSearches?.length || 0),
          0
        );

        const locationCount = new Set(
          publishedRecruiters
            .map((item) => item.location?.trim())
            .filter(Boolean)
        ).size;

        const skillCount = new Set(
          publishedRecruiters.flatMap((item) =>
            (item.tags || [])
              .map((tag) => tag.skill?.value?.trim())
              .filter(Boolean) as string[]
          )
        ).size;

        setInsights([
          {
            icon: 'star',
            value: avgRating > 0 ? avgRating.toFixed(1) : 'N/A',
            label: 'Average recruiter rating',
          },
          {
            icon: 'clipboard',
            value: `${totalActiveSearches}+`,
            label: 'Active recruiter searches',
          },
          {
            icon: 'globe',
            value: `${locationCount}+`,
            label: 'Locations covered',
          },
          {
            icon: 'brain',
            value: `${skillCount}+`,
            label: 'Skills and specialties',
          },
        ]);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
        // Fallback to default data if API fails
        setInsights([
          {
            icon: 'star',
            value: '4.9',
            label: 'Avg. client ratings in Development & IT',
          },
          {
            icon: 'clipboard',
            value: '211k+',
            label: 'Projects completed',
          },
          {
            icon: 'globe',
            value: '140+',
            label: 'Countries available',
          },
          {
            icon: 'brain',
            value: '1,665',
            label: 'Skills and specialties',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <section className="py-16 sm:py-20">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-slate-600">Loading insights...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(125deg,rgba(241,245,249,0.72),rgba(255,255,255,0.96))] bg-size-[100%_100%]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(148,163,184,0.14)_0px,rgba(148,163,184,0.14)_1px,transparent_1px,transparent_18px)]" />
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-lime-400/70 sm:block" />
        <div className="absolute top-1/2 left-0 hidden h-px w-full -translate-y-1/2 bg-lime-400/70 sm:block" />

        <div className="relative grid grid-cols-1 sm:grid-cols-2">
          {insights.map((item, index) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <div
                key={item.label}
                className={`flex min-h-52 items-start justify-between gap-6 p-8 sm:p-10 ${
                  index < 2 ? 'border-b border-slate-200/70 sm:border-b-0' : ''
                } ${index % 2 === 0 ? 'sm:pr-14' : 'sm:pl-14'}`}
              >
                <div>
                  <p className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-3 max-w-[22ch] text-base font-medium leading-snug text-slate-700">
                    {item.label}
                  </p>
                </div>
                <div className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-700">
                  <Icon className="size-8 stroke-[1.75]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
