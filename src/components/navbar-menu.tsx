"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutsideClick } from "@/hooks/use-outside-click";

export function NavbarMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(menuRef, close);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="User menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <User className="size-5" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
          <Link
            href="/profile"
            onClick={close}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Profile
          </Link>
          <Link
            href="/dashboard"
            onClick={close}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/messages"
            onClick={close}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Messages
          </Link>
        </div>
      ) : null}
    </div>
  );
}
