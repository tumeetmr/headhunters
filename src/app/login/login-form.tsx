"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/providers/language-provider";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCallbackUrl = searchParams.has("callbackUrl");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(t("login.error"));
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError(t("login.error"));
      return;
    }

    const destination = hasCallbackUrl ? result.url ?? callbackUrl : "/profile";

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/image/lambda.png"
          alt="Lambda"
          width={108}
          height={22}
          priority
        />
      </div>

      {/* Heading */}
      <h1 className="mb-6 text-[1.75rem] font-bold leading-tight tracking-tight text-primary-text">
        {t("login.title")}
      </h1>

      <form onSubmit={handlePasswordSignIn}>
        {/* Email */}
        <div className="mb-3">
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-primary-text"
          >
            {t("login.email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-3.5 text-sm text-primary-text outline-none transition focus:border-zinc-400"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-primary-text"
          >
            {t("login.password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-3.5 text-sm text-primary-text outline-none transition focus:border-zinc-400"
          />
        </div>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        {/* Primary action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary-text py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("login.signingIn") : t("login.confirm")}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-8 text-center text-sm text-zinc-500">
        {t("login.newUser")}{" "}
        <Link
          href="/register"
          className="font-semibold text-primary-text hover:underline"
        >
          {t("login.register")}
        </Link>
      </p>
    </div>
  );
}
