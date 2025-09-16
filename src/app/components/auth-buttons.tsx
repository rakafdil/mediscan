"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "./ui/button";

import { LOGIN_PATH } from "@/constant/common";
import useUser from "@/hooks/useUser";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { useState, useRef, useEffect } from "react";

import { createClient } from "../utils/supabase/client";

export default function AuthButton() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const supabase = createClient();

  if (pathname === LOGIN_PATH) return null;

  if (loading) {
    return (
      <div className="h-12 w-12 rounded-full bg-gray-200" />
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    Promise.resolve().then(() => window.location.href = '/login')

  }

  if (user) {
    return (
      <div className="" ref={navbarRef}>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="cursor-pointer flex items-center justify-center h-12 w-12 rounded-full transition-colors duration-200 bg-[#496687] text-white hover:bg-[#3a526c] font-semibold"
          >
            <FontAwesomeIcon icon={faUser} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/10 z-50">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  await handleLogout();
                  setOpen(false);
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Button className="group" asChild>
      <Link
        href={LOGIN_PATH}
        className="hidden md:flex md:text-xl sm:text-lg px-8 py-7 rounded-xl transition-colors duration-200 bg-[#496687] text-white hover:bg-[#3a526c] font-semibold"
      >
        Login
      </Link>
    </Button>
  );
}
