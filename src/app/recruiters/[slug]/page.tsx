"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Mail, Phone, Linkedin, Star, ExternalLink, Send, Loader } from "lucide-react";
import { useRecruiterBySlug } from "@/hooks/useRecruiter";
import { useLanguage } from "@/providers/language-provider";
import { fetchFormTemplates, submitRecruiterRequest, type FormTemplate, type FormAnswer } from "@/lib/forms-api";
import { FormRenderer } from "@/components/forms/form-renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatSlugToName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function RecruiterDetailPage() {
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

  const isCompany = session?.user?.role === "COMPANY";

  // Fetch form template on mount
  useEffect(() => {
    const loadFormTemplate = async () => {
      try {
        setIsLoadingForm(true);
        const templates = await fetchFormTemplates();
        const activeTemplate = templates.find((t) => t.isActive) || templates[0];
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

  const handleFormSubmit = async (answers: FormAnswer[]) => {
    if (!recruiter || !formTemplate) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await submitRecruiterRequest({
        formTemplateId: formTemplate.id,
        recruiterId: recruiter.id,
        answers,
      });

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
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {displayName}
                </h1>
                <p className="mt-2 text-lg font-medium text-zinc-600 dark:text-zinc-300">
                  {recruiter.title}
                </p>
                {recruiter.tagline && (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 italic">
                    "{recruiter.tagline}"
                  </p>
                )}
              </div>
              {recruiter.isLeadPartner && recruiter.partnerBadge && (
                <span className="inline-block shrink-0 rounded-full bg-linear-to-r from-[#36CCC7] to-[#34E89E] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
                  ⭐ {recruiter.partnerBadge}
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {recruiter.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  {recruiter.location}
                </span>
              )}
              {recruiter.yearsExperience != null && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  {recruiter.yearsExperience} {t("recruiter.yrsExperience")}
                </span>
              )}
              {recruiter.rating > 0 && (
                <span className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(recruiter.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span>{recruiter.rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            {/* Bio */}
            {recruiter.bio && (
              <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {recruiter.bio}
                </p>
              </div>
            )}

            {/* Action buttons - improved layout */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {recruiter.publicEmail && (
                  <a
                    href={`mailto:${recruiter.publicEmail}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                {(recruiter.publicPhone || phoneLink) && (
                  <a
                    href={`tel:${recruiter.publicPhone || phoneLink?.url}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
                      className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
              </div>

              {/* Request Button for Companies - Primary CTA */}
              {isCompany && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  disabled={isSubmitting || isLoadingForm || !formTemplate}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Requesting...
                    </>
                  ) : isLoadingForm ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Request Recruiter
                    </>
                  )}
                </button>
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
        <div className="mt-8 space-y-6">
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
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("recruiter.skills")}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-lg bg-linear-to-r from-[#36CCC7]/10 to-[#34E89E]/10 px-3 py-1.5 text-sm font-medium text-[#2BA8A3] dark:text-[#36CCC7]"
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
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("recruiter.insights")}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recruiter.insights
              .filter((i) => i.status === "PUBLISHED")
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((insight) => (
                <div
                  key={insight.id}
                  className="overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800"
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
              Tell us about your needs and we'll connect you shortly
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
    </div>
  );
}

function TagCard({ title, tags }: { title: string; tags: { id: string; skill: { value: string } }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-block rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {tag.skill.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function TagSection({ title, tags }: { title: string; tags: { id: string; skill: { value: string } }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {title}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tag.skill.value}
          </span>
        ))}
      </div>
    </div>
  );
}
