"use client";

import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faYoutube, faXTwitter} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function Footer() {
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setNow(Date.now());
    }, []);

    return (
        <footer className="bg-[#B6C7D9] text-black rounded-t-3xl px-30 pt-10 pb-6 max-w-7xl mx-auto">
            <div className="flex flex-col min-h-full">

                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between gap-10">

                    {/* Left Section */}
                    <div className="flex flex-col gap-6">
                        {/* Navigation */}
                        <nav className="flex flex-wrap gap-6 mb-4 ml-60 text-lg">
                            <a href="/" className="hover:underline font-medium">Home</a>
                            <a href="/symptom-checker" className="hover:underline font-medium">Symptom Checker</a>
                            <a href="/hospital" className="hover:underline font-medium">Hospital</a>
                            <a href="/article" className="hover:underline font-medium">Article</a>
                        </nav>

                        {/* Contact Info */}
                        <div className="text-xm leading-8 -mt-0 font-montserrat">
                            <p className="font-semibold mb-2 border-2 border-white bg-white text-black px-3 py-0.5 inline-block rounded-lg">
                                Contact us:
                            </p>
                            <p className="mb-2">
                                Email:{" "}
                                    alomany.tif@gmail.com
                                Phone: 0853-1234-5678
                            </p>
                            <p>
                                Address: 1234 Main St Moonstone City, Stardust State 12345
                            </p>
                            {/* Social Icons */}
                            <div className="flex gap-4 ml-auto items-start mb-8 leading-8 mt-4">
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#496687] hover:text-red-600 transition"
                                >
                                    <FontAwesomeIcon icon={faYoutube} size="2x"/>
                                </a>
                                <a
                                    href="https://github.com/rakafdil/mediscan.git"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#496687] hover:text-gray-800 transition"
                                >
                                    <FontAwesomeIcon icon={faGithub} size="2x"/>
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#496687] hover:text-black transition"
                                >
                                    <FontAwesomeIcon icon={faXTwitter} size="2x"/>
                                </a>
                                <a
                                    href="mailto:alomany@gmail.com"
                                    className="text-[#496687] hover:text-blue-400 transition"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} size="2x"/>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center md:justify-end items-center">
                        <img src="../assets/Footer.png" alt="mediscan logo" className="w-40 md:w-60 h-auto" />
                    </div>
                </div>

                {/* Bottom Section (Copyright) */}
                <div className="mt-6 pt-4 flex items-center gap-6 text-xm font-montserrat">
                    <span>© 2025 Alomany. All Rights Reserved.</span>
                    <a href="/privacy-policy" className="hover:underline">
                        Privacy Policy
                    </a>
                </div>
            </div>
        </footer>
    );
}
