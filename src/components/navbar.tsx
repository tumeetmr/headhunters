"use client";

import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Bell } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import StaggeredMenu from "@/components/menu";
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/providers/language-provider";

export default function Navbar() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.jobs"), href: "/jobs" },
    { label: t("nav.applications"), href: "/applications" },
    { label: t("nav.headhunting"), href: "/headhunting" },
  ];

  const menuItems = [
    { label: t("nav.home"), ariaLabel: "Go to home page", link: "/" },
    { label: t("nav.jobs"), ariaLabel: "Browse jobs and projects", link: "/jobs" },
    { label: t("nav.applications"), ariaLabel: "View my applications", link: "/applications" },
    { label: t("nav.headhunting"), ariaLabel: "Headhunting services", link: "/headhunting" },
    ...(isLoggedIn 
      ? [
          { label: "Profile", ariaLabel: "Go to profile", link: "/profile" },
          { label: "Logout", ariaLabel: "Sign out", onClick: () => signOut({ callbackUrl: '/' }) }
        ]
      : [{ label: t("nav.login"), ariaLabel: "Go to login", link: "/login" }]
    )
  ];

  const socialItems = [
    { label: "Facebook", link: "https://facebook.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
    { label: "Instagram", link: "https://instagram.com" },
  ];

  return (
    <nav className="relative w-full bg-white dark:bg-black">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="hidden relative z-50 md:flex items-center gap-2">
            <Image src="/image/lambda.png" alt="Lambda logo" width={100} height={21} priority />
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary-text transition-colors hover:text-primary-text/80 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Language + Profile (Desktop only) */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-primary-text transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Profile"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-red-500 transition-colors hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-primary-text transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label={t("nav.login")}
              title={t("nav.login")}
            >
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu - StaggeredMenu */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <LanguageSwitcher />
        </div>
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials
          displayItemNumbering
          menuButtonColor="#212B36"
          openMenuButtonColor="#000"
          changeMenuColorOnOpen
          colors={["#e4e4e7", "#f4f4f5"]}
          logoUrl="/image/lambda.png"
          accentColor="#36CCC7"
          isFixed
        />
      </div>
    </nav>
  );
}
