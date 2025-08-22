"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/assets/Logo.png";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-15 py-2 shadow-sm bg-white font-montserrat">
            <Link href="/" className="flex flex-col items-center gap-2">
                <Image src={Logo} alt="Logo Mediscan" width={40} height={40} priority />
                <span className="font-josefin font-bold text-[#496687]">
                    mediScan
                </span>
            </Link>

            <ul className="flex items-center gap-20 text-gray-700 font-semibold">
                <li>
                    <Link
                        href="/"
                        className="hover:bg-[#217BFF] px-5 py-4 hover:text-white transition-colors duration-200 rounded-xl"
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        href="/symptom-checker"
                        className="hover:bg-[#217BFF] px-5 py-4 hover:text-white transition-colors duration-200 rounded-xl"
                    >
                        Symptom Checker
                    </Link>
                </li>
                <li>
                    <Link
                        href="/hospital"
                        className="hover:bg-[#217BFF] px-5 py-4 hover:text-white transition-colors duration-200 rounded-xl"
                    >
                        Hospital
                    </Link>
                </li>
                <li>
                    <Link
                        href="/article"
                        className="hover:bg-[#217BFF] px-5 py-4 hover:text-white transition-colors duration-200 rounded-xl"
                    >
                        Article
                    </Link>
                </li>
            </ul>

            <Link
                href="/login"
                className="bg-[#496687] text-white px-4 py-2 rounded-xl hover:bg-[#3a526c] transition-colors duration-200"
            >
                Login
            </Link>
        </nav>
    );
};

export default Navbar;
