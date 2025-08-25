"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../../public/assets/Logo.png";

const Navbar = () => {
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/symptom-checker", label: "Symptom Checker" },
        { href: "/hospital", label: "Hospital" },
        { href: "/article", label: "Article" },
    ];

    return (
        <nav className="flex items-center justify-between px-15 py-2 shadow-sm bg-white font-montserrat">

            <Link href="/" className="flex flex-col items-center gap-2">
                <Image
                    src={Logo}
                    alt="Logo Mediscan"
                    width={37}
                    height={37}
                    priority
                />
                <span className="font-josefin font-bold text-[#496687]">mediScan</span>
            </Link>

            <ul className="flex items-center gap-12 font-semibold">
                {navLinks.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={`px-5 py-4 rounded-xl transition-colors duration-200 ${pathname.startsWith(link.href) && link.href !== "/"
                                ? "bg-[#217BFF] text-white"
                                : pathname === "/" && link.href === "/"
                                    ? "bg-[#217BFF] text-white"
                                    : "text-gray-700 hover:bg-[#5b9dff] hover:text-white"
                                }`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <Link
                href="/login"
                className="bg-[#496687] text-white px-5 py-4 rounded-xl hover:bg-[#3a526c] transition-colors duration-200 font-semibold"
            >
                Login
            </Link>
        </nav>
    );
};

export default Navbar;
