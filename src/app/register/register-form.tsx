"use client";

import { isAxiosError } from "axios";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BriefcaseBusiness, UserRound } from "lucide-react";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language-provider";

type RegisterRole = "RECRUITER" | "COMPANY";
type RegisterErrorResponse = {
  message?: string | string[];
  error?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCallbackUrl = searchParams.has("callbackUrl");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const { t } = useLanguage();

  const [step, setStep] = useState<"selection" | "details">("selection");
  const [role, setRole] = useState<RegisterRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getOnboardingRoute(nextRole: RegisterRole) {
    return nextRole === "COMPANY"
      ? "/register/create/company"
      : "/register/create/recruiter";
  }

  function getLoginHref() {
    return hasCallbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
  }

  function getErrorMessage(registrationError: unknown) {
    if (isAxiosError<RegisterErrorResponse>(registrationError)) {
      const apiMessage = Array.isArray(registrationError.response?.data?.message)
        ? registrationError.response?.data?.message[0]
        : registrationError.response?.data?.message ?? registrationError.response?.data?.error;

      if (typeof apiMessage === "string" && apiMessage.trim()) {
        return apiMessage;
      }
    }

    if (registrationError instanceof Error && registrationError.message) {
      return registrationError.message;
    }

    return t("register.errorGeneral");
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError(t("register.errorGeneral"));
      return;
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError(t("register.errorRequiredFields"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("register.errorPasswordMatch"));
      return;
    }

    setLoading(true);

    try {
      await post("/auth/register", {
        email: normalizedEmail,
        password,
        name: normalizedName,
        role,
      });

      const signInResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!signInResult || signInResult.error) {
        router.push(getLoginHref());
        return;
      }

      const destination = hasCallbackUrl
        ? signInResult.url ?? callbackUrl
        : getOnboardingRoute(role);

      router.push(destination);
      router.refresh();
    } catch (registrationError) {
      setError(getErrorMessage(registrationError));
    } finally {
      setLoading(false);
    }
  }

  function updateRole(nextRole: RegisterRole) {
    setRole(nextRole);
    setError(null);
  }

  function continueWithRole() {
    if (!role) {
      setError(t("register.errorRequiredFields"));
      return;
    }
    setError(null);
    setStep("details");
  }

  function backToRoleSelection() {
    setError(null);
    setStep("selection");
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm">
      <div className="mb-8">
        <Image
          src="/image/lambda.png"
          alt="Lambda"
          width={108}
          height={22}
          priority
        />
      </div>

      {step === "selection" ? (
        <>
          <h1 className="mb-6 text-[1.75rem] font-bold leading-tight tracking-tight text-primary-text">
            Join as a company or recruiter
          </h1>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={role === "COMPANY"}
              onClick={() => updateRole("COMPANY")}
              className={`rounded-xl border p-4 text-left transition-colors ${
                role === "COMPANY"
                  ? "border-primary-text bg-zinc-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <BriefcaseBusiness className="size-5 text-zinc-700" />
                <span
                  className={`size-6 rounded-full border ${
                    role === "COMPANY" ? "border-primary-text" : "border-zinc-300"
                  }`}
                />
              </div>
              <p className="text-[1.75rem] leading-tight font-semibold text-primary-text sm:text-xl">
                I&apos;m a company, hiring for a role
              </p>
            </button>

            <button
              type="button"
              aria-pressed={role === "RECRUITER"}
              onClick={() => updateRole("RECRUITER")}
              className={`rounded-xl border p-4 text-left transition-colors ${
                role === "RECRUITER"
                  ? "border-primary-text bg-zinc-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <UserRound className="size-5 text-zinc-700" />
                <span
                  className={`size-6 rounded-full border ${
                    role === "RECRUITER" ? "border-primary-text" : "border-zinc-300"
                  }`}
                />
              </div>
              <p className="text-[1.75rem] leading-tight font-semibold text-primary-text sm:text-xl">
                I&apos;m a recruiter, looking for candidates
              </p>
            </button>
          </div>

          {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}

          <Button
            type="button"
            variant="gradient"
            size="lg"
            disabled={!role}
            onClick={continueWithRole}
            className="h-12 w-full rounded-xl text-sm font-medium"
          >
            Create Account
          </Button>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={backToRoleSelection}
              className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-primary-text"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
              {role === "COMPANY" ? t("register.company") : t("register.recruiter")}
            </span>
          </div>

          <h1 className="mb-6 text-[1.75rem] font-bold leading-tight tracking-tight text-primary-text">
            {t("register.title")}
          </h1>

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-primary-text"
              >
                {t("register.fullName")}
              </label>
              <Input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("register.placeholderName")}
                required
                aria-invalid={Boolean(error)}
                className="h-12 rounded-xl border-zinc-200 px-4 py-3 text-sm text-primary-text placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-primary-text"
              >
                {t("register.email")}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("register.placeholderEmail")}
                required
                aria-invalid={Boolean(error)}
                className="h-12 rounded-xl border-zinc-200 px-4 py-3 text-sm text-primary-text placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
              />
              <p className="mt-1 text-xs text-zinc-500">{t("register.workEmailHint")}</p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-primary-text"
              >
                {t("register.password")}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("register.placeholderPassword")}
                required
                aria-invalid={Boolean(error)}
                className="h-12 rounded-xl border-zinc-200 px-4 py-3 text-sm text-primary-text placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-primary-text"
              >
                {t("register.confirmPassword")}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("register.placeholderConfirmPassword")}
                required
                aria-invalid={Boolean(error)}
                className="h-12 rounded-xl border-zinc-200 px-4 py-3 text-sm text-primary-text placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl text-sm font-medium"
            >
              {loading ? t("register.submitting") : t("register.submit")}
            </Button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-sm text-zinc-500">
        {t("register.haveAccount")}{" "}
        <Link
          href={getLoginHref()}
          className="font-semibold text-primary-text hover:underline"
        >
          {t("register.signIn")}
        </Link>
      </p>
    </div>
  );
}
