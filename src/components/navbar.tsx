"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, User, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Job & Projects", href: "/jobs" },
  { label: "My Applications", href: "/applications" },
  { label: "Headhunting", href: "/headhunting" },
];

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between bg-white px-32 py-4 dark:bg-black">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/image/lambda.png" alt="Lambda logo" width={100} height={21} priority />
        </Link>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#212B36] transition-colors hover:text-[#212B36]/80 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Language + Profile */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-[#212B36] transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <Globe className="h-4 w-4" />
          English
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-[#212B36] transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <User className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
