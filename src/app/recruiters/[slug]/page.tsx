"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Mail, Phone, Linkedin, Star, ExternalLink, Send, Loader, Heart, MessageSquare } from "lucide-react";
import { useRecruiterBySlug } from "@/hooks/useRecruiter";
import { useLanguage } from "@/providers/language-provider";
import { fetchFormTemplates, submitRecruiterRequest, fetchRequests, type FormTemplate, type FormAnswer, type RecruitRequest } from "@/lib/forms-api";
import { profileApi } from "@/lib/profile-api";
import { FormRenderer } from "@/components/forms/form-renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatSlugToName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Requested",
  COUNTER_PROPOSED: "Counter Proposed",
  ACCEPTED: "Request Accepted",
  COMPLETED: "Engagement Completed",
  DECLINED: "Request Declined",
};

export default function RecruiterDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { recruiter, loading, error } = useRecruiterBySlug(slug);
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [shortlistNote, setShortlistNote] = useState("");
  const [isSavingShortlist, setIsSavingShortlist] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingReview, setRatingReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isLoadingInteraction, setIsLoadingInteraction] = useState(false);
  const [existingRequest, setExistingRequest] = useState<RecruitRequest | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [canRateRecruiter, setCanRateRecruiter] = useState(false);
  const [hasRatedRecruiter, setHasRatedRecruiter] = useState(false);
  const [existingRatingValue, setExistingRatingValue] = useState<number | null>(null);
  const [existingRatingReview, setExistingRatingReview] = useState("");

  const isCompany = session?.user?.role === "COMPANY";

  // Fetch form template on mount
  useEffect(() => {
    const loadFormTemplate = async () => {
      try {
        setIsLoadingForm(true);
        const templates = await fetchFormTemplates();
        const activeTemplate = templates.find((t) => t.isActive !== false);
        setFormTemplate(activeTemplate || null);
      } catch (error) {
        console.error("Failed to load form template:", error);
        setFormTemplate(null);
      } finally {
        setIsLoadingForm(false);
      }
    };

    loadFormTemplate();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCompanyInteractionState = async () => {
      if (!isCompany || !recruiter?.id) {
        setExistingRequest(null);
        setIsShortlisted(false);
        setCanRateRecruiter(false);
        setHasRatedRecruiter(false);
        setExistingRatingValue(null);
        setExistingRatingReview("");
        return;
      }

      try {
        setIsLoadingInteraction(true);

        const [requests, shortlist, ratingState] = await Promise.all([
          fetchRequests(),
          profileApi.getCompanyShortlist(),
          profileApi.getMyRecruiterRating(recruiter.id),
        ]);

        if (cancelled) return;

        const requestForRecruiter =
          requests.find((request) => request.recruiterId === recruiter.id) ?? null;
        const shortlistMatch = shortlist.some(
          (item) => item.recruiterProfileId === recruiter.id,
        );

        setExistingRequest(requestForRecruiter);
        setIsShortlisted(shortlistMatch);
        setCanRateRecruiter(ratingState.canRate);
        setHasRatedRecruiter(ratingState.hasRated);
        setExistingRatingValue(ratingState.review?.rating ?? null);
        setExistingRatingReview(ratingState.review?.comment ?? "");
      } catch (error) {
        console.error("Failed to load company interaction status:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingInteraction(false);
        }
      }
    };

    void loadCompanyInteractionState();

    return () => {
      cancelled = true;
    };
  }, [isCompany, recruiter?.id]);

  const handleFormSubmit = async (answers: FormAnswer[]) => {
    if (!recruiter || !formTemplate) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const createdRequest = await submitRecruiterRequest({
        formTemplateId: formTemplate.id,
        recruiterId: recruiter.id,
        answers,
      });

      setExistingRequest(createdRequest);
      setMessage({ type: "success", text: "Request sent successfully!" });
      setIsFormOpen(false);
      
      // Reset after 2 seconds
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send request. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToShortlist = async () => {
    if (!recruiter) return;

    setIsSavingShortlist(true);
    setMessage(null);

    try {
      await profileApi.addRecruiterToShortlist(
        recruiter.id,
        shortlistNote.trim() || undefined,
      );

      setIsShortlisted(true);
      setMessage({ type: "success", text: "Recruiter added to shortlist." });
      setIsShortlistOpen(false);
      setShortlistNote("");

      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save shortlist item. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSavingShortlist(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!recruiter || ratingValue === 0) return;

    setIsSubmittingRating(true);
    setMessage(null);

    try {
      await profileApi.rateRecruiter(
        recruiter.id,
        ratingValue,
        ratingReview.trim() || undefined,
      );

      setCanRateRecruiter(true);
      setHasRatedRecruiter(true);
      setExistingRatingValue(ratingValue);
      setExistingRatingReview(ratingReview.trim());
      setMessage({ type: "success", text: "Thank you for your rating!" });
      setIsRatingOpen(false);
      setRatingValue(0);
      setRatingReview("");

      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit rating. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link skeleton */}
        <div className="skeleton h-5 w-28 rounded" />

        {/* Profile header skeleton */}
        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          {/* Photo skeleton */}
          <div className="skeleton aspect-square w-full max-w-xs shrink-0 rounded-2xl" />

          {/* Info skeleton */}
          <div className="flex-1 space-y-5">
            {/* Name + badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="skeleton h-8 w-56 rounded sm:w-72" />
                <div className="skeleton h-5 w-40 rounded" />
                <div className="skeleton h-4 w-52 rounded" />
              </div>
              <div className="skeleton h-7 w-24 shrink-0 rounded-full" />
            </div>

            {/* Meta row skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="skeleton h-5 w-28 rounded" />
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-5 w-16 rounded" />
            </div>

            {/* Contact buttons skeleton */}
            <div className="flex flex-wrap gap-3">
              <div className="skeleton h-9 w-24 rounded-lg" />
              <div className="skeleton h-9 w-20 rounded-lg" />
              <div className="skeleton h-9 w-28 rounded-lg" />
            </div>

            {/* Bio skeleton */}
            <div className="space-y-2 pt-2">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          </div>
        </div>

        {/* Tags sections skeleton */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="flex flex-wrap gap-2">
                <div className="skeleton h-7 w-20 rounded-md" />
                <div className="skeleton h-7 w-28 rounded-md" />
                <div className="skeleton h-7 w-16 rounded-md" />
                <div className="skeleton h-7 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Skills skeleton */}
        <div className="mt-12 space-y-3">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Insights skeleton */}
        <div className="mt-12 space-y-4">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="flex flex-wrap justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-56 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="skeleton aspect-9/16 w-full" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-4 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !recruiter) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-lg text-zinc-500">{t("recruiters.notFound")}</p>
        <Link
          href="/"
          className="mt-4 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {t("recruiter.backHome")}
        </Link>
      </div>
    );
  }

  const displayName = formatSlugToName(recruiter.slug);
  const expertiseTags = recruiter.tags
    .filter((t) => t.skill.type === "EXPERTISE")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const industryTags = recruiter.tags
    .filter((t) => t.skill.type === "INDUSTRY")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const languageTags = recruiter.tags
    .filter((t) => t.skill.type === "LANGUAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const certTags = recruiter.tags
    .filter((t) => t.skill.type === "CERTIFICATION")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const skills = recruiter.tags
    .filter((t) => t.skill.type === "SKILL")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.skill);
  const linkedinLink = recruiter.links.find((l) => l.type === "LINKEDIN");
  const phoneLink = recruiter.links.find((l) => l.type === "PHONE");
  const hasRequestedRecruiter = Boolean(existingRequest);
  const requestStatusLabel = existingRequest
    ? REQUEST_STATUS_LABELS[existingRequest.status] || `Requested (${existingRequest.status})`
    : null;

  const handlePrimaryAction = () => {
    if (hasRequestedRecruiter && existingRequest?.id) {
      router.push(`/dashboard?tab=requests&requestId=${existingRequest.id}`);
      return;
    }

    setIsFormOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("recruiter.back")}
      </Link>

      {/* Main content card */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* Profile header section */}
        <div className="flex flex-col gap-8 p-6 md:flex-row md:p-8 lg:p-10">
          {/* Photo */}
          <div className="relative aspect-square w-full max-w-sm shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {recruiter.photoUrl ? (
              <Image
                src={recruiter.photoUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800">
                <span className="text-6xl font-bold text-zinc-400 dark:text-zinc-500">
                  {displayName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Header with badge */}
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div className="flex-1">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {recruiter.user.name || displayName}
                  </h1>
                  {recruiter.isLeadPartner && recruiter.partnerBadge && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-200">
                      <span>⭐</span>
                      {recruiter.partnerBadge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xl font-semibold text-zinc-700 dark:text-zinc-200">
                  {recruiter.title}
                </p>
                {recruiter.tagline && (
                  <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 italic">
                    &ldquo;{recruiter.tagline}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {recruiter.location && (
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
                    <MapPin className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Location</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{recruiter.location}</p>
                  </div>
                </div>
              )}
              {recruiter.yearsExperience != null && (
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
                    <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Experience</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{recruiter.yearsExperience} {t("recruiter.yrsExperience")}</p>
                  </div>
                </div>
              )}
              {recruiter.rating > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                    <Star className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{recruiter.rating.toFixed(1)}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(recruiter.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-300 dark:text-zinc-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {recruiter.bio && (
              <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-700">
                <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                  {recruiter.bio}
                </p>
              </div>
            )}

            {/* Contact Links - always visible */}
              <div className="mt-8 flex flex-wrap gap-2 border-t border-zinc-200 pt-8 dark:border-zinc-700">
                {recruiter.publicEmail && (
                  <a
                    href={`mailto:${recruiter.publicEmail}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                {(recruiter.publicPhone || phoneLink) && (
                  <a
                    href={`tel:${recruiter.publicPhone || phoneLink?.url}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {linkedinLink && (
                  <a
                    href={linkedinLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {recruiter.links
                  .filter((l) => l.type !== "LINKEDIN" && l.type !== "PHONE")
                  .slice(0, 2)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
              </div>

            {/* Action buttons - improved layout */}
            <div className="mt-8 space-y-4">
              {/* Primary Action */}
              {isCompany && (
                <>
                  <button
                    onClick={handlePrimaryAction}
                    disabled={
                      isSubmitting ||
                      isLoadingForm ||
                      isLoadingInteraction ||
                      !formTemplate
                    }
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary-text px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-text/90 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Requesting...</span>
                      </>
                    ) : isLoadingForm ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : isLoadingInteraction ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Checking status...</span>
                      </>
                    ) : hasRequestedRecruiter && requestStatusLabel ? (
                      <>
                        <Send className="h-5 w-5" />
                        <span>{requestStatusLabel}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Request Recruiter</span>
                      </>
                    )}
                  </button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Message */}
                    <Link
                      href={`/messages?recruiterId=${recruiter.id}&name=${encodeURIComponent(displayName)}`}
                      className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 bg-white px-3 py-3.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="hidden sm:inline">Message</span>
                      <span className="sm:hidden">Chat</span>
                    </Link>

                    {/* Rate */}
                    <button
                      onClick={() => {
                        setRatingValue(existingRatingValue ?? 0);
                        setRatingReview(existingRatingReview);
                        setIsRatingOpen(true);
                      }}
                      disabled={isSubmittingRating || isLoadingInteraction || (!canRateRecruiter && !hasRatedRecruiter)}
                      className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 bg-white px-3 py-3.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                    >
                      <Star className={`h-5 w-5 ${hasRatedRecruiter ? "fill-amber-400 text-amber-400" : ""}`} />
                      <span className="hidden sm:inline">{hasRatedRecruiter ? "Rated" : "Rate"}</span>
                      <span className="sm:hidden">★</span>
                    </button>

                    {/* Shortlist */}
                    <button
                      onClick={() => setIsShortlistOpen(true)}
                      disabled={isSavingShortlist || isLoadingInteraction || isShortlisted}
                      className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 bg-white px-3 py-3.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                    >
                      {isSavingShortlist ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className={`h-5 w-5 ${isShortlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                      )}
                      <span className="hidden sm:inline">{isShortlisted ? "Saved" : "Save"}</span>
                      <span className="sm:hidden">❤</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                  message.type === "success"
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
                    : "border-red-300 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags and Skills sections */}
      {(expertiseTags.length > 0 ||
        industryTags.length > 0 ||
        languageTags.length > 0 ||
        certTags.length > 0 ||
        skills.length > 0) && (
        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {expertiseTags.length > 0 && (
              <TagCard title={t("recruiter.expertise")} tags={expertiseTags} />
            )}
            {industryTags.length > 0 && (
              <TagCard title={t("recruiter.industries")} tags={industryTags} />
            )}
            {languageTags.length > 0 && (
              <TagCard title={t("recruiter.languages")} tags={languageTags} />
            )}
            {certTags.length > 0 && (
              <TagCard title={t("recruiter.certifications")} tags={certTags} />
            )}
          </div>

          {/* Skills section */}
          {skills.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t("recruiter.skills")}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-lg bg-linear-to-r from-emerald-50 to-teal-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 dark:from-emerald-900/20 dark:to-teal-900/20 dark:text-emerald-200"
                  >
                    {skill.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {recruiter.insights.filter((i) => i.status === "PUBLISHED").length > 0 && (
        <div className="mt-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t("recruiter.insights")}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recruiter.insights
              .filter((i) => i.status === "PUBLISHED")
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((insight) => (
                <div
                  key={insight.id}
                  className="overflow-hidden rounded-xl border border-zinc-100 shadow-sm transition-all hover:shadow-md dark:border-zinc-800"
                >
                  <div className="relative aspect-9/16 w-full bg-zinc-100 dark:bg-zinc-800">
                    <iframe
                      src={insight.mediaUrl}
                      title={insight.title}
                      className="h-full w-full"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Request Form Dialog - Improved UX */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader className="space-y-1 pb-4">
            <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Request {displayName}
            </DialogTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              Tell us about your needs and we&apos;ll connect you shortly
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {formTemplate && (
              <div>
                <FormRenderer
                  template={formTemplate}
                  isLoading={isSubmitting}
                  onSubmit={handleFormSubmit}
                  submitButtonLabel="Send Request"
                />
              </div>
            )}
            {message && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                  message.type === "success"
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
                    : "border-red-300 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shortlist Note Dialog */}
      <Dialog open={isShortlistOpen} onOpenChange={setIsShortlistOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Add {displayName} to Shortlist
            </DialogTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add an internal note so your team knows why this recruiter is shortlisted.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <textarea
              value={shortlistNote}
              onChange={(event) => setShortlistNote(event.target.value)}
              rows={5}
              placeholder="Example: Strong fintech track record, fast response, ideal for VP Eng search."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsShortlistOpen(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                disabled={isSavingShortlist}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleAddToShortlist()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={isSavingShortlist}
              >
                {isSavingShortlist ? "Saving..." : "Save to Shortlist"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {hasRatedRecruiter ? "Update Rating" : "Rate"} {displayName}
            </DialogTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {hasRatedRecruiter
                ? "Update your feedback for this recruiter"
                : "Share your experience working with this recruiter"}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Star Rating */}
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= ratingValue
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300 dark:text-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Review Text Area */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                Add a review (optional)
              </label>
              <textarea
                value={ratingReview}
                onChange={(event) => setRatingReview(event.target.value)}
                rows={4}
                placeholder="Share your feedback about this recruiter's professionalism, responsiveness, and match quality..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRatingOpen(false);
                  setRatingValue(0);
                  setRatingReview("");
                }}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                disabled={isSubmittingRating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitRating()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={isSubmittingRating || ratingValue === 0}
              >
                {isSubmittingRating
                  ? "Submitting..."
                  : hasRatedRecruiter
                    ? "Update Rating"
                    : "Submit Rating"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TagCard({ title, tags }: { title: string; tags: { id: string; skill: { value: string } }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-block rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-200"
          >
            {tag.skill.value}
          </span>
        ))}
      </div>
    </div>
  );
}
