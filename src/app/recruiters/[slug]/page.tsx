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
    <div className="mx-auto w-full max-w-7xl animate-fade-in px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("recruiter.back")}
      </Link>

      {/* Profile header */}
      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        {/* Photo */}
        <div className="relative aspect-square w-full max-w-xs shrink-0 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-primary-text dark:text-zinc-50 sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
                {recruiter.title}
              </p>
              {recruiter.tagline && (
                <p className="mt-1 text-sm italic text-zinc-400 dark:text-zinc-500">
                  {recruiter.tagline}
                </p>
              )}
            </div>
            {recruiter.isLeadPartner && recruiter.partnerBadge && (
              <span className="shrink-0 rounded-full bg-linear-to-r from-[#36CCC7] to-[#34E89E] px-3 py-1 text-xs font-semibold text-white">
                {recruiter.partnerBadge}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {recruiter.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {recruiter.location}
              </span>
            )}
            {recruiter.yearsExperience != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {recruiter.yearsExperience} {t("recruiter.yrsExperience")}
              </span>
            )}
            {recruiter.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {recruiter.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Contact links */}
          <div className="mt-4 flex flex-wrap gap-3">
            {recruiter.publicEmail && (
              <a
                href={`mailto:${recruiter.publicEmail}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-primary-text transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Mail className="h-4 w-4" />
                {t("recruiter.email")}
              </a>
            )}
            {(recruiter.publicPhone || phoneLink) && (
              <a
                href={`tel:${recruiter.publicPhone || phoneLink?.url}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-primary-text transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Phone className="h-4 w-4" />
                {t("recruiter.call")}
              </a>
            )}
            {linkedinLink && (
              <a
                href={linkedinLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-primary-text transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
            {recruiter.links
              .filter((l) => l.type !== "LINKEDIN" && l.type !== "PHONE")
              .map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-primary-text transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link.label}
                </a>
              ))}

            {/* Request Button for Companies */}
            {isCompany && (
              <button
                onClick={() => setIsFormOpen(true)}
                disabled={isSubmitting || isLoadingForm || !formTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-60 dark:border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
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
              className={`mt-4 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                message.type === "success"
                  ? "border-green-300 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
                  : "border-red-300 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Bio */}
          {recruiter.bio && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {t("recruiter.about")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                {recruiter.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tags sections */}
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {expertiseTags.length > 0 && (
          <TagSection title={t("recruiter.expertise")} tags={expertiseTags} />
        )}
        {industryTags.length > 0 && (
          <TagSection title={t("recruiter.industries")} tags={industryTags} />
        )}
        {languageTags.length > 0 && (
          <TagSection title={t("recruiter.languages")} tags={languageTags} />
        )}
        {certTags.length > 0 && (
          <TagSection title={t("recruiter.certifications")} tags={certTags} />
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {t("recruiter.skills")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full bg-linear-to-r from-[#36CCC7]/10 to-[#34E89E]/10 px-3 py-1 text-sm font-medium text-[#2BA8A3] dark:text-[#36CCC7]"
              >
                {skill.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {recruiter.insights.filter((i) => i.status === "PUBLISHED").length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {t("recruiter.insights")}
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {recruiter.insights
              .filter((i) => i.status === "PUBLISHED")
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((insight) => (
                <div
                  key={insight.id}
                  className="w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div className="relative aspect-9/16 w-full">
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

      {/* Request Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request {displayName}</DialogTitle>
          </DialogHeader>
          {formTemplate && (
            <FormRenderer
              template={formTemplate}
              isLoading={isSubmitting}
              onSubmit={handleFormSubmit}
              submitButtonLabel="Send Request"
            />
          )}
          {message && (
            <div
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
                message.type === "success"
                  ? "border-green-300 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
                  : "border-red-300 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
