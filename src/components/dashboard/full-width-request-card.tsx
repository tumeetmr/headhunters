"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type RecruitRequest } from "@/lib/forms-api";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { ChevronRight, MapPin, Briefcase, MessageSquare, User, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FullWidthRequestCardProps {
  request: RecruitRequest;
  role?: string;
  onClick?: () => void;
  onMessage?: () => void;
}

function answerByKey(request: RecruitRequest, key: string) {
  return request.answers?.find((a) => a.formField?.key === key)?.value || "Untitled Request";
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
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function FullWidthRequestCard({
  request,
  role,
  onClick,
  onMessage,
}: FullWidthRequestCardProps) {
  const positionTitle = answerByKey(request, "position_title");
  
  // For company side, show recruiter info
  if (role === "COMPANY" && request.recruiter) {
    const recruiter = request.recruiter;
    const recruiterName = recruiter.user?.name || "Unknown Recruiter";
    
    return (
      <Card
        className="group cursor-pointer border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Position Header */}
            <div className="border-b border-slate-100 pb-4">
              <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-slate-900">
                {positionTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Request sent {prettyDate(request.createdAt)}
              </p>
            </div>

            {/* Recruiter Profile Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-start gap-4">
                {/* Recruiter Photo */}
                <div className="shrink-0">
                  {recruiter.photoUrl ? (
                    <Image
                      src={recruiter.photoUrl}
                      alt={recruiterName}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700">
                      {recruiterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Recruiter Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold text-slate-900">{recruiterName}</p>
                    {recruiter.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {recruiter.title && (
                    <p className="mt-0.5 text-sm font-medium text-slate-600">{recruiter.title}</p>
                  )}

                  {recruiter.tagline && (
                    <p className="mt-1 text-xs text-slate-500">{recruiter.tagline}</p>
                  )}

                  {/* Meta Info */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recruiter.yearsExperience && (
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                        <Briefcase className="h-3 w-3 text-slate-500" />
                        <span>{recruiter.yearsExperience}+ years</span>
                      </div>
                    )}

                    {recruiter.location && (
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{recruiter.location}</span>
                      </div>
                    )}

                    {recruiter.rating && recruiter.rating > 0 && (
                      <div className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{recruiter.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-col items-end gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <RequestStatusBadge status={request.status} />
                    <p className="mt-2 text-xs text-slate-500">{request.answers?.length || 0} responses</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {recruiter.slug && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs"
                    >
                      <Link href={`/recruiters/${recruiter.slug}`}>
                        <User className="mr-1.5 h-3.5 w-3.5" />
                        Profile
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessage?.();
                    }}
                    className="text-xs"
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default company side (no recruiter data yet)
  const counterpart =
    role === "RECRUITER"
      ? request.company?.name || "Unknown Company"
      : request.recruiter?.user?.name || "Unknown Recruiter";
  const meta =
    role === "RECRUITER"
      ? request.company?.industry || "General"
      : request.recruiter?.title || "Recruiter";
  const location =
    role === "RECRUITER"
      ? request.company?.location || "Remote"
      : "Remote";

  return (
    <Card
      className="group cursor-pointer border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
                {counterpart.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-slate-900">
                  {positionTitle}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-700">{counterpart}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-slate-600 md:gap-3">
              {meta && (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                  <span>{meta}</span>
                </div>
              )}
              {location && (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{location}</span>
                </div>
              )}
              <div className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                {prettyDate(request.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-right">
              <RequestStatusBadge status={request.status} />
              <p className="mt-2 text-xs text-slate-500">{request.answers?.length || 0} responses</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
