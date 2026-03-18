"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Linkedin, Instagram } from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/lambda.global.official", label: "Facebook" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/lambdaglobal", label: "LinkedIn" },
  { icon: Instagram, href: "https://www.instagram.com/lambda.global", label: "Instagram" },
];

export default function Footer() {
  const footerLinks = [
    { label: "Find Recruiters", href: "/recruiters" },
    { label: "Browse Projects", href: "/projects" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/70">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 md:pb-8 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/image/lambda.png" alt="Lambda logo" width={100} height={32} priority />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 md:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
               className="text-sm font-medium text-primary-text transition-colors hover:text-primary-text/80 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-10 flex flex-col justify-between gap-10 md:flex-row md:items-end">
        <div className="max-w-xl space-y-2 text-sm text-slate-600">
          <p className="text-base font-semibold text-slate-900">Hire the recruiter. Not the agency.</p>
          <p>
            Headhunters connects companies directly with elite independent recruiters.
            No retainers. No middlemen. Just measurable hiring outcomes.
          </p>
          <p>
            hello@lambda.global · +976 8888 8003
          </p>
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 md:h-16 md:w-16"
            >
              <social.icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      <hr className="mt-10 border-slate-200" />

      <div className="mt-6 flex flex-col items-start justify-between gap-4 text-sm text-slate-500 md:flex-row md:items-center">
        <p>© 2026 Huntly by Lambda. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="transition-colors hover:text-slate-900">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-slate-900">
            Terms of Service
          </Link>
        </div>
      </div>
      </div>
    </footer>
  );
}
