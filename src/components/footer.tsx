"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Linkedin, Instagram } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    { label: t("footer.home"), href: "/" },
    { label: t("footer.about"), href: "https://lambda.global/about#ourapproach" },
    { label: t("footer.features"), href: "/features" },
    { label: t("footer.pricing"), href: "/pricing" },
    { label: t("footer.contact"), href: "/contact" },
    { label: t("footer.reviews"), href: "/reviews" },
  ];

  return (
    <footer className="w-full bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 md:pt-12 md:pb-8 lg:px-8">
      {/* Top row: Logo + Nav links */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/image/lambda.png" alt="Lambda logo" width={100} height={32} priority />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 md:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#212B36] transition-colors hover:text-[#212B36]/80 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Middle: Contact info + Social icons */}
      <div className="mt-10 flex flex-col justify-between gap-10 md:flex-row md:items-end">
        {/* Contact info */}
        <div className="flex flex-col gap-5 text-sm font-medium text-[#212B36] dark:text-zinc-100">
          <p>+976 8888 8003</p>
          <p>hello@lambda.global</p>
          <p>
            360 Mandala Residential Tower, Ikh Khuree St,
            <br />
            Ulaanbaatar 13312, Mongolia
          </p>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-[#212B36] transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 md:h-20 md:w-20"
            >
              <social.icon className="h-5 w-5 md:h-7 md:w-7" />
            </a>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="mt-10 border-zinc-200 dark:border-zinc-800" />

      {/* Bottom row: Copyright + Legal links */}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400 md:flex-row md:items-center">
        <p>{t("footer.copyright")}</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="transition-colors hover:text-[#212B36] dark:hover:text-zinc-50">
            {t("footer.privacy")}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-[#212B36] dark:hover:text-zinc-50">
            {t("footer.terms")}
          </Link>
        </div>
      </div>
      </div>
    </footer>
  );
}
