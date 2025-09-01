// components/FeatureCard.jsx
'use client'

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface FeatureCardProps {
    href: string;
    icon: IconProp;
    title: string;
    description: string;
}

const FeatureCard = ({ href, icon, title, description }: FeatureCardProps) => {
    return (
        <a href={href}>
            <div className="group bg-white rounded-xl shadow-lg p-6 sm:p-8 text-left hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center items-center rounded-full bg-[#E74040] w-16 h-16 sm:w-18 sm:h-18 ml-1 mb-4 sm:mb-6">
                    <FontAwesomeIcon
                        icon={icon}
                        className="text-white"
                        size="xl"
                    />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 
        after:content-[''] after:block after:w-12 after:h-[2px] after:bg-red-500 
        after:mt-2 after:scale-x-0 group-hover:after:scale-x-100 
        after:transition-transform after:duration-300">
                    {title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {description}
                </p>
            </div>
        </a>

    );
};

export default FeatureCard;