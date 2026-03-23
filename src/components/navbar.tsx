"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import StaggeredMenu from "@/components/menu";
import { NavbarMenu } from "@/components/navbar-menu";

const NAV_LINKS = [
  { label: "Recruiters", href: "/recruiters" },
  { label: "Jobs", href: "/jobs" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const mobileMenuItems = useMemo(
    () => [
      ...NAV_LINKS.map((link) => ({
        label: link.label,
        ariaLabel: `Go to ${link.label}`,
        link: link.href,
      })),
      isLoggedIn
        ? { label: "Dashboard", ariaLabel: "Go to dashboard", link: "/dashboard" }
        : { label: "Join Us", ariaLabel: "Register account", link: "/register" },
    ],
    [isLoggedIn]
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="hidden md:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-9">
            <Link href="/" className="relative z-50 flex items-center gap-2">
              <Image src="/image/lambda.png" alt="Lambda logo" width={112} height={24} priority />
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center md:flex">
            {isLoggedIn ? (
              <NavbarMenu />
            ) : (
              <Button size="sm" asChild>
                <Link href="/register">Join Us</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="h-14" aria-hidden="true" />
        <StaggeredMenu
          isFixed={true}
          logoUrl="/image/lambda.png"
          menuButtonColor="#0f172a"
          openMenuButtonColor="#0f172a"
          accentColor="#0f172a"
          colors={["#f8fafc", "#e2e8f0"]}
          displaySocials={false}
          items={mobileMenuItems}
        />
      </div>
    </nav>
  );
}
