// components/VideoSection.jsx
'use client'

import Image from "next/image";

const VideoSection = () => {
    return (
        <div className="min-h-[400px] sm:min-h-[500px] lg:h-160 w-full flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 lg:px-30 py-10 gap-8 lg:gap-0">
            {/* Left side - Text */}
            <div className="w-full lg:max-w-md font-montserrat text-center lg:text-left">
                <div className="my-6 sm:my-8 lg:my-10 mt-5">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#252B42] mb-3">
                        How to Use Symptom Scan in 4 Easy Steps
                    </h2>
                </div>

                <p className="text-[#737373] text-sm mb-4">
                    Watch this quick video to learn how to scan your symptoms and get instant insights.
                </p>

                <div className="my-12 sm:my-16 lg:my-20">
                    <a
                        href="#"
                        className="text-[#252B42] font-medium hover:underline flex items-center justify-center lg:justify-start gap-1"
                    >
                        Learn More <span>›</span>
                    </a>
                </div>
            </div>

            {/* Right side - Video with background element */}
            <div className="relative w-full max-w-lg sm:max-w-xl lg:w-160 flex items-center justify-center">
                {/* Background element */}
                <Image
                    src="/assets/element2.png"
                    alt="Background Shape"
                    className="absolute w-[100%] h-[100%] -top-9 -left-60 lg:-top-15 lg:-left-16 z-0"
                    width={400}
                    height={400}
                />

                {/* Video */}
                <div className="h-56 sm:h-72 lg:h-96 w-full rounded-lg overflow-hidden shadow-md relative z-10 bg-gray-200 ml-6 sm:ml-10 lg:ml-14">
                    <iframe
                        src="https://www.youtube.com/embed/VIDEO_ID"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default VideoSection;