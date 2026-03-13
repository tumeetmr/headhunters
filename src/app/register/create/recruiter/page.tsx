"use client";

import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { post } from "@/lib/api";
import { useLanguage } from "@/providers/language-provider";

type StepIndex = 1 | 2;

type CreateRecruiterPayload = {
  userId: string;
  slug: string;
  title: string;
  tagline: string;
  bio: string;
  photoUrl?: string;
  heroImageUrl?: string;
  yearsExperience: number;
  isLeadPartner: boolean;
  partnerBadge?: string;
  publicEmail: string;
  publicPhone: string;
  location: string;
  timezone: string;
  visibility: string;
  skillIds: string[];
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
};

const partnerBadgeOptions = [
  "NONE",
  "CERTIFIED",
  "GOLD",
  "PLATINUM",
] as const;

const timezoneOptions = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Europe/Tokyo",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateRecruiterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [isLeadPartner, setIsLeadPartner] = useState(false);
  const [partnerBadge, setPartnerBadge] = useState("NONE");
  const [publicEmail, setPublicEmail] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [currentStep, setCurrentStep] = useState<StepIndex>(1);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    t("register.stepRegister"),
    t("register.stepPersonalInfo"),
  ] as const;

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const session = await getSession();

      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        router.replace("/login?callbackUrl=/register/create/recruiter");
        return;
      }

      if (session.user.role !== "RECRUITER") {
        router.replace(
          session.user.role === "COMPANY" 
            ? "/register/create/company" 
            : "/"
        );
        return;
      }

      setUserId(session.user.id ?? "");
      setEmail(session.user.email ?? "");
      setPublicEmail(session.user.email ?? "");
      setIsCheckingSession(false);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function getErrorMessage(submissionError: unknown) {
    if (isAxiosError<ApiErrorResponse>(submissionError)) {
      const apiMessage = Array.isArray(submissionError.response?.data?.message)
        ? submissionError.response?.data?.message[0]
        : submissionError.response?.data?.message ?? submissionError.response?.data?.error;

      if (typeof apiMessage === "string" && apiMessage.trim()) {
        return apiMessage;
      }
    }

    if (submissionError instanceof Error && submissionError.message) {
      return submissionError.message;
    }

    return t("register.createError");
  }

  function validateRecruiterStep() {
    if (
      !title.trim() ||
      !tagline.trim() ||
      !bio.trim() ||
      !publicEmail.trim() ||
      !publicPhone.trim() ||
      !location.trim() ||
      !yearsExperience
    ) {
      setError(t("register.completeAllDetails"));
      return false;
    }

    return true;
  }

  async function handleContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (!validateRecruiterStep()) {
      return;
    }

    if (!userId) {
      setError(t("register.missingUserId"));
      return;
    }

    const payload: CreateRecruiterPayload = {
      userId,
      slug: slugify(title),
      title: title.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      publicEmail: publicEmail.trim(),
      publicPhone: publicPhone.trim(),
      location: location.trim(),
      timezone,
      yearsExperience: parseInt(yearsExperience, 10) || 0,
      isLeadPartner,
      partnerBadge: partnerBadge !== "NONE" ? partnerBadge : undefined,
      visibility: "DRAFT",
      skillIds: [],
      ...(photoUrl.trim() ? { photoUrl: photoUrl.trim() } : {}),
      ...(heroImageUrl.trim() ? { heroImageUrl: heroImageUrl.trim() } : {}),
    };

    setIsSubmitting(true);

    try {
      await post("/recruiters", payload);
      router.push("/");
      router.refresh();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    setError(null);
    setCurrentStep((prev) => (prev === 1 ? 1 : ((prev - 1) as StepIndex)));
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#f4f5f7] px-4 py-12 sm:px-8">
        <p className="text-sm text-zinc-500">{t("register.loadingInformation")}</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-accent px-4 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto mt-16 max-w-5xl overflow-x-auto">
          <div className="min-w-155">
            <div className="grid grid-cols-2 gap-0">
              {steps.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  {i > 0 ? (
                    <div
                      className={`absolute top-3 right-1/2 left-0 h-px ${
                        i <= currentStep ? "bg-primary-text" : "bg-zinc-200"
                      }`}
                    />
                  ) : null}
                  {i < steps.length - 1 ? (
                    <div
                      className={`absolute top-3 left-1/2 right-0 h-px ${
                        i < currentStep ? "bg-primary-text" : "bg-zinc-200"
                      }`}
                    />
                  ) : null}
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        i <= currentStep ? "bg-primary-text" : "bg-zinc-200"
                      }`}
                    />
                  </div>
                  <h3 className="mt-4 whitespace-nowrap text-sm font-bold text-primary-text sm:text-base">
                    {step}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mx-auto mt-14 w-full max-w-4xl rounded-3xl bg-white px-6 py-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-3xl font-semibold text-[#101828]">
              {currentStep === 1 ? t("register.personalInfo") : t("register.personalInfo")}
            </h2>
            <p className="text-sm text-zinc-500">
              {currentStep === 1
                ? t("register.personalInfoDescription")
                : t("register.recruiterProfileDescription")}
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {currentStep === 1 ? (
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="email" className="block text-sm font-medium text-[#374151]">
                    {t("register.email")}
                  </label>
                  <span className="text-xs text-[#9ca3af]">{t("register.workEmailHint")}</span>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                />
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.jobTitle")} *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("register.placeholderJobTitle")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="tagline" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.tagline")} *
                  </label>
                  <Input
                    id="tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder={t("register.placeholderTagline")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.bio")} *
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("register.placeholderBio")}
                    required
                    rows={5}
                    className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#0b4f63]"
                  />
                </div>

                <div>
                  <label htmlFor="yearsExperience" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.yearsExperience")} *
                  </label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder={t("register.placeholderYearsExperience")}
                    required
                    min="0"
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.timezone")} *
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#0b4f63]"
                  >
                    {timezoneOptions.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="publicEmail" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.publicEmail")} *
                  </label>
                  <Input
                    id="publicEmail"
                    type="email"
                    value={publicEmail}
                    onChange={(e) => setPublicEmail(e.target.value)}
                    placeholder={t("register.placeholderPublicEmail")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="publicPhone" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.publicPhone")} *
                  </label>
                  <Input
                    id="publicPhone"
                    type="tel"
                    value={publicPhone}
                    onChange={(e) => setPublicPhone(e.target.value)}
                    placeholder={t("register.placeholderPublicPhone")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.location")} *
                  </label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("register.placeholderLocationRecruiter")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="partnerBadge" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.partnerBadge")}
                  </label>
                  <select
                    id="partnerBadge"
                    value={partnerBadge}
                    onChange={(e) => setPartnerBadge(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#0b4f63]"
                  >
                    {partnerBadgeOptions.map((badge) => (
                      <option key={badge} value={badge}>
                        {badge}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    id="isLeadPartner"
                    type="checkbox"
                    checked={isLeadPartner}
                    onChange={(e) => setIsLeadPartner(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d1d5db] accent-primary-text"
                  />
                  <label htmlFor="isLeadPartner" className="text-sm font-medium text-[#374151]">
                    {t("register.leadPartner")}
                  </label>
                </div>

                <div>
                  <label htmlFor="photoUrl" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.photoUrl")}
                  </label>
                  <Input
                    id="photoUrl"
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder={t("register.placeholderPhotoUrl")}
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="heroImageUrl" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.heroImageUrl")}
                  </label>
                  <Input
                    id="heroImageUrl"
                    type="url"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder={t("register.placeholderHeroImageUrl")}
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="h-12 rounded-xl px-7 text-base font-medium"
              >
                {t("register.back")}
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isSubmitting}
                className="h-12 rounded-xl px-7 text-base font-medium"
              >
                {currentStep === 2
                  ? isSubmitting
                    ? t("register.creatingProfile")
                    : t("register.completeSetup")
                  : t("register.continue")}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
