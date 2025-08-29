"use client";

import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setNow(Date.now());
    }, []);

    return (
        <footer className="bg-[#B6C7D9] text-black rounded-t-3xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-8 md:pt-10 pb-6 max-w-7xl mx-auto">
            <div className="flex flex-col min-h-full">

                {/* Top Section */}
                <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-10">

                    {/* Left Section */}
                    <div className="flex flex-col gap-6 flex-1">
                        {/* Navigation */}
                        <nav className="flex flex-wrap gap-4 sm:gap-6 mb-4 text-base sm:text-lg justify-center sm:justify-start lg:ml-0">
                            <Link href="/" className="hover:underline font-medium">Home</Link>
                            <Link href="/symptom-checker" className="hover:underline font-medium">Symptom Checker</Link>
                            <Link href="/hospital" className="hover:underline font-medium">Hospital</Link>
                            <Link href="/article" className="hover:underline font-medium">Article</Link>
                        </nav>

                        {/* Contact Info */}
                        <div className="text-sm sm:text-base leading-6 sm:leading-8 font-montserrat text-center sm:text-left">
                            <p className="font-semibold mb-3 sm:mb-2 border-2 border-white bg-white text-black px-3 py-1 inline-block rounded-lg">
                                Contact us:
                            </p>
                            <div className="mb-2 space-y-1">
                                <p>Email: alomany.tif@gmail.com</p>
                                <p>Phone: 0853-1234-5678</p>
                            </div>
                            <p className="mb-4">
                                Address: 1234 Main St Moonstone City, Stardust State 12345
                            </p>

                            {/* Social Icons */}
                            <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start items-center">
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#496687] hover:text-red-600 transition-colors duration-200"
                                    aria-label="YouTube"
                                >
                                    <FontAwesomeIcon icon={faYoutube} size="lg" className="sm:text-2xl" />
                                </a>
                                <a
                                    href="https://github.com/rakafdil/mediscan.git"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#496687] hover:text-gray-800 transition-colors duration-200"
                                    aria-label="GitHub"
                                >
                                    <FontAwesomeIcon icon={faGithub} size="lg" className="sm:text-2xl" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#496687] hover:text-black transition-colors duration-200"
                                    aria-label="Twitter"
                                >
                                    <FontAwesomeIcon icon={faXTwitter} size="lg" className="sm:text-2xl" />
                                </a>
                                <a
                                    href="mailto:alomany@gmail.com"
                                    className="text-[#496687] hover:text-blue-400 transition-colors duration-200"
                                    aria-label="Email"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} size="lg" className="sm:text-2xl" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center lg:justify-end items-start lg:items-center mt-4 lg:mt-0">
                        <Image
                            src="/assets/Footer.png"
                            alt="mediscan logo"
                            className="w-32 sm:w-40 md:w-48 lg:w-60 h-auto"
                            width={240}
                            height={120}
                        />
                    </div>
                </div>

                {/* Bottom Section (Copyright) */}
                <div className="mt-6 pt-4 border-t border-gray-400/30 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-6 text-xs sm:text-sm font-montserrat">
                    <span>© 2025 Alomany. All Rights Reserved.</span>
                    <a href="/privacy-policy" className="hover:underline transition-colors duration-200">
                        Privacy Policy
                    </a>
                </div>
            </div>
        </footer>
    );
}