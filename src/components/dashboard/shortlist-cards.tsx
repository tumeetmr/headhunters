"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ShortlistedRecruiter {
  id: string;
  recruiterProfileId: string;
  recruiterId: string;
  recruiter: {
    id: string;
    title?: string | null;
    yearsExperience?: number | null;
    rating?: number;
    location?: string | null;
    photoUrl?: string | null;
    slug: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  };
  note?: string | null;
  createdAt: string;
}

interface ShortlistCardsProps {
  shortlist: ShortlistedRecruiter[];
  loading: boolean;
  onRecruiterClick?: (recruiter: ShortlistedRecruiter) => void;
  onRemove?: (id: string) => void;
}

function prettyDate(input?: string | null) {
  if (!input) return "-";
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function ShortlistCards({
  shortlist,
  loading,
  onRecruiterClick,
  onRemove,
}: ShortlistCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    );
  }

  if (!shortlist || shortlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
        <div className="mb-4 rounded-full bg-slate-100 p-3">
          <Heart className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No shortlists yet</h3>
        <p className="mt-1 text-sm text-slate-600">
          Save recruiters to your shortlist for easy access
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shortlist.map((item) => {
        const recruiter = item.recruiter;
        const displayName = recruiter.user?.name || "Unknown Recruiter";

        return (
          <Card
            key={item.id}
            className="border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0 text-rose-600 hover:bg-rose-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRemove) {
                      onRemove(item.id);
                    }
                  }}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>

              <div className="mt-2">
                <h3 className="font-semibold text-slate-900">{displayName}</h3>
                {recruiter.title && (
                  <p className="text-sm text-slate-600">{recruiter.title}</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex gap-3">
                {recruiter.yearsExperience && (
                  <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                    <span>{recruiter.yearsExperience}+ yrs</span>
                  </div>
                )}
                {recruiter.rating && recruiter.rating > 0 && (
                  <div className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                    <Star className="h-3 w-3 fill-yellow-500" />
                    <span>{recruiter.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {recruiter.location && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{recruiter.location}</span>
                </div>
              )}

              {item.note && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-700">Note</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.note}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Added {prettyDate(item.createdAt)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    if (onRecruiterClick) {
                      onRecruiterClick(item);
                    }
                  }}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
