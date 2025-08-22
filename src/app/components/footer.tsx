"use client";

export default function Footer() {
    return (
        <footer className="bg-[#B6C7D9] text-black rounded-t-3xl px-8 pt-10 pb-6 max-w-7xl mx-auto">
            <div className="flex flex-col min-h-full">
                
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    
                    {/* Left Section */}
                    <div className="flex flex-col gap-6">
                        {/* Navigation */}
                        <nav className="flex flex-wrap gap-6 mb-4 ml-50">
                            <a href="/" className="hover:underline font-medium">Home</a>
                            <a href="/symptom-checker" className="hover:underline font-medium">Symptom Checker</a>
                            <a href="/hospital" className="hover:underline font-medium">Hospital</a>
                            <a href="/article" className="hover:underline font-medium">Article</a>
                        </nav>

                        {/* Contact Info */}
                        <div className="text-sm leading-7 -mt-6">
                            <p className="font-semibold mb-2 border-2 border-white bg-white text-black px-3 py-0.5 inline-block rounded-lg">
                                Contact us:
                            </p>
                            <p>
                                Email:{" "}
                                <a href="mailto:alomany.tif@gmail.com" className="hover:underline">
                                    alomany.tif@gmail.com
                                </a>{" "}
                                | Phone: 0853-1234-5678
                            </p>
                            <p>
                                Address: 1234 Main St Moonstone City, Stardust State 12345
                            </p>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center md:justify-end items-center">
                        <img src="../assets/Footer.png" alt="mediscan logo" className="w-40 md:w-60 h-auto" />
                    </div>
                </div>

                {/* Bottom Section (Copyright) */}
                <div className="mt-6 pt-4 md:flex-row justify-between items-center text-xs gap-3">
                    <span>© 2025 Alomany. All Rights Reserved.</span>
                    <a href="/privacy-policy" className="hover:underline">
                        Privacy Policy
                    </a>
                </div>
            </div>
        </footer>
    );
}
