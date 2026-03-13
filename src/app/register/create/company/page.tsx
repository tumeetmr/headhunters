"use client";

import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { post } from "@/lib/api";
import { useLanguage } from "@/providers/language-provider";

type StepIndex = 1 | 2 | 3;
type PaymentPlan = "MONTHLY" | "ANNUAL";

type CreateCompanyPayload = {
  userId: string;
  name: string;
  slug: string;
  industry: string;
  website?: string;
  logoUrl?: string;
  description: string;
  size: string;
  location: string;
  skillIds: string[];
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
};

const companySizeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateCompanyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [currentStep, setCurrentStep] = useState<StepIndex>(1);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    t("register.stepRegister"),
    t("register.stepPersonalInfo"),
    t("register.stepCompanyProject"),
    t("register.stepPayment"),
  ] as const;

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const session = await getSession();

      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        router.replace("/login?callbackUrl=/register/create/company");
        return;
      }

      setUserId(session.user.id ?? "");
      setEmail(session.user.email ?? "");
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

  function validateCompanyStep() {
    if (!companyName.trim() || !industry.trim() || !description.trim() || !companySize || !location.trim()) {
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

    if (currentStep === 2) {
      if (!validateCompanyStep()) {
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (!selectedPlan) {
      setError(t("register.selectPayment"));
      return;
    }

    if (!validateCompanyStep()) {
      setCurrentStep(2);
      return;
    }

    if (!userId) {
      setError(t("register.missingUserId"));
      return;
    }

    const payload: CreateCompanyPayload = {
      userId,
      name: companyName.trim(),
      slug: slugify(companyName),
      industry: industry.trim(),
      description: description.trim(),
      size: companySize,
      location: location.trim(),
      skillIds: [],
      ...(website.trim() ? { website: website.trim() } : {}),
      ...(logoUrl.trim() ? { logoUrl: logoUrl.trim() } : {}),
    };

    setIsSubmitting(true);

    try {
      await post("/companies", payload);
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
        <p className="text-sm text-zinc-500">Loading your information...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-accent px-4 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto mt-16 max-w-5xl overflow-x-auto">
          <div className="min-w-155">
            <div className="grid grid-cols-4 gap-0">
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
              {currentStep === 1 ? t("register.personalInfo") : currentStep === 2 ? t("register.companyDetails") : t("register.pricingPlans")}
            </h2>
            <p className="text-sm text-zinc-500">
              {currentStep === 1
                ? t("register.personalInfoDescription")
                : currentStep === 2
                  ? t("register.companyDetailsDescription")
                  : t("register.pricingDescription")}
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {currentStep === 1 ? (
              <div >
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
                  <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.company")}
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t("register.placeholderCompanyName")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.industry")}
                  </label>
                  <Input
                    id="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder={t("register.placeholderIndustry")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="companySize" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.companySize")}
                  </label>
                  <select
                    id="companySize"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#0b4f63]"
                  >
                    <option value="">{t("register.selectSize")}</option>
                    {companySizeOptions.map((sizeOption) => (
                      <option key={sizeOption} value={sizeOption}>
                        {sizeOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.location")}
                  </label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("register.placeholderLocation")}
                    required
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.website")}
                  </label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder={t("register.placeholderWebsite")}
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="logoUrl" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.logoUrl")}
                  </label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder={t("register.placeholderLogoUrl")}
                    className="h-12 rounded-xl border border-[#d1d5db] px-4 text-sm text-[#111827] focus-visible:border-[#0b4f63] focus-visible:ring-0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#374151]">
                    {t("register.description")}
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("register.placeholderDescription")}
                    required
                    rows={5}
                    className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#0b4f63]"
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="space-y-8">
                {/* Cards */}
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Monthly */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("MONTHLY")}
                    className={`rounded-2xl border px-7 py-7 text-left transition ${
                      selectedPlan === "MONTHLY"
                        ? "border-primary-text ring-1 ring-primary-text"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-base font-semibold text-[#e57373]">{t("register.monthly")}</p>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#101828]">₮300,000</span>
                      <span className="text-sm text-zinc-400">{t("register.userPerMonth")}</span>
                    </div>

                    <hr className="my-5 border-zinc-200" />

                    <ul className="space-y-3">
                      {(
                        [
                          "register.feature1",
                          "register.feature2",
                          "register.feature3",
                          "register.feature4",
                          "register.feature5",
                        ] as const
                      ).map((key) => (
                        <li key={key} className="flex items-start gap-3 text-sm text-[#374151]">
                          <svg className="mt-px h-5 w-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </button>

                  {/* Annual */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("ANNUAL")}
                    className={`rounded-2xl border px-7 py-7 text-left transition ${
                      selectedPlan === "ANNUAL"
                        ? "border-primary-text ring-1 ring-primary-text"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-[#e57373]">{t("register.annual")}</p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          -50%
                        </span>
                      </div>
                      <span className="rounded-lg bg-primary-text px-3 py-1 text-xs font-semibold text-white">
                        {t("register.recommended")}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#101828]">₮1,800,000</span>
                      <span className="text-sm text-zinc-400 line-through">3,600,000</span>
                      <span className="text-sm text-zinc-400">{t("register.userPerYear")}</span>
                    </div>

                    <hr className="my-5 border-zinc-200" />

                    <ul className="space-y-3">
                      {(
                        [
                          "register.featureBadge",
                          "register.feature1",
                          "register.feature2",
                          "register.feature3",
                          "register.feature4",
                          "register.feature5",
                        ] as const
                      ).map((key) => (
                        <li key={key} className="flex items-start gap-3 text-sm text-[#374151]">
                          <svg className="mt-px h-5 w-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </button>
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
                {currentStep === 3
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
