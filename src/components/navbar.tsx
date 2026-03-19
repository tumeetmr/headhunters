"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const navLinks = [
    { label: "Recruiters", href: "/recruiters" },
    { label: "Jobs", href: "/jobs" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-9">
          <Link href="/" className="relative z-50 flex items-center gap-2">
            <Image src="/image/lambda.png" alt="Lambda logo" width={112} height={24} priority />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
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
          <Button size="sm" asChild>
            <Link href="/register">Join Us</Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-200/70 px-4 py-2 md:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <Button size="sm" asChild>
            <Link href="/register">Join Us</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
