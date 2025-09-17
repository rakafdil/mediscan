'use client'

import Image from "next/image";

const HeroSection = () => {
    return (
        <div className="relative xl:h-[870px] lg:h-[770px]">
            <div className="container font-montserrat mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-20 pb-8 relative z-10">
                <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-0">
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 lg:mr-20 text-center lg:text-left lg:relative">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl lg:text-5xl font-bold text-gray-800 mb-6 sm:mb-8 leading-tight">
                            Scan Now for<br className="hidden sm:block" />
                            Better Health
                        </h1>
                        <p className="text-[#737373] text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                            Scan your symptoms early and get<br className="hidden sm:block" />
                            AI-powered insights
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a href="/symptom-checker" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto hover:border-[#628EF7] hover:border-2 hover:text-[#628EF7] hover:bg-white bg-[#628EF7] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                                    Start Scan Now
                                </button>
                            </a>
                            <button
                                className="w-full sm:w-auto border-1 border-[#628EF7] hover:bg-[#628EF7] hover:text-white text-[#628EF7] font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
                                onClick={() => {
                                    const el = document.getElementById("about-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="w-full lg:w-[700px] relative flex justify-center mt-8 lg:mt-0">
                        <Image
                            src="/assets/Section1.svg"
                            alt="Hero Image"
                            className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-5xl xl:w-[1050px] h-auto relative z-10"
                            width={1050}
                            height={700}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
