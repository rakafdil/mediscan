"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "./ui/button";

import { LOGIN_PATH } from "@/constant/common";
import useUser from "@/hooks/useUser";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";


export default function AuthButton() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  if (pathname === LOGIN_PATH) return null;

  if (loading) {
    return (
      <div className="h-12 w-12 rounded-full bg-gray-200" />
    );
  }


  if (user) {
    return (
      <Link
        href="/account"
        className="text-center md:text-xl sm:text-lg h-12 w-12 rounded-full transition-colors duration-200 bg-[#496687] text-white hover:bg-[#3a526c] font-semibold"
      >
        <FontAwesomeIcon icon={faUser} className='mt-3' />
      </Link>
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
