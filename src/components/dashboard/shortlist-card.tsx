"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type ShortlistedRecruiter } from "@/components/dashboard/shortlist-cards";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star } from "lucide-react";

interface listCardProps {
  item: ShortlistedRecruiter;
  onRemove?: (id: string) => void;
  onClick?: () => void;
}

function prettyDate(input?: string | null) {
  if (!input) return "-";
  const date = new Date(input);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ShortlistCard({ item, onRemove, onClick }: listCardProps) {
  const recruiter = item.recruiter;
  const displayName = recruiter.user?.name || "Unknown Recruiter";

  return (
    <Card className="cursor-pointer border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md" onClick={onClick}>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-slate-900">
                {displayName}
              </h3>
              {recruiter.title && (
                <p className="mt-1 line-clamp-1 text-sm text-slate-600">{recruiter.title}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                {recruiter.yearsExperience && (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                    {recruiter.yearsExperience}+ yrs
                  </span>
                )}
                {recruiter.rating && recruiter.rating > 0 && (
                  <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
                    <Star className="h-3 w-3 fill-yellow-500" />
                    {recruiter.rating.toFixed(1)}
                  </span>
                )}
                {recruiter.location && (
                  <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {recruiter.location}
                  </span>
                )}
              </div>

              {item.note && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="line-clamp-2 text-xs text-slate-600">{item.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs font-medium text-slate-500">
              Saved {prettyDate(item.createdAt)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-lg border border-transparent p-0 text-rose-600 hover:border-rose-100 hover:bg-rose-50"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(item.id);
              }}
              title="Remove from shortlist"
            >
              <Heart className="h-5 w-5 fill-current" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
