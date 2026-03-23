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
  const navLinks = [
    { label: "Find Recruiters", href: "/recruiters" },
    { label: "Browse Jobs", href: "/jobs" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <footer className="w-full border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section - Logo and Navigation */}
        <div className="flex flex-col items-start justify-between gap-8 border-slate-200 py-8 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/image/lambda.png" alt="Lambda logo" width={100} height={32} priority />
          </Link>
          <nav className="flex flex-wrap items-center gap-6 md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Middle Section - Contact Info and Social */}
        <div className="flex flex-col items-start justify-between gap-10 py-12 md:flex-row md:items-start">
          <div className="space-y-4 text-sm text-slate-700">
            <p className="text-base font-semibold text-slate-900">Hire the recruiter. Not the agency.</p>
            <p className="text-slate-600">
              Headhunters connects companies directly with elite independent recruiters.
              No retainers. No middlemen. Just measurable hiring outcomes.
            </p>
            <p className="font-semibold text-slate-900">hello@lambda.global · +976 8888 8003</p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section - Copyright and Legal Links */}
        <div className="flex flex-col items-start justify-between gap-6 border-t border-slate-200 py-8 text-sm text-slate-600 md:flex-row md:items-center">
          <p>© 2026 Huntly by Lambda. All rights reserved.</p>
          <div className="flex items-center gap-8">
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
