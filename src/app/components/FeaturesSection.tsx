// components/FeaturesSection.jsx
'use client'

import FeatureCard from './FeatureCard';
import { faStethoscope } from '@fortawesome/free-solid-svg-icons';
import { faNewspaper, faHospital } from '@fortawesome/free-regular-svg-icons';

const FeaturesSection = () => {
    const features = [
        {
            href: '/symptom-checker',
            icon: faStethoscope,
            title: 'Smart Health Scanning',
            description: 'Scan your symptoms anytime, anywhere. The smarter you are, the better you can take care of yourself.'
        },
        {
            href: '/article',
            icon: faNewspaper,
            title: 'Medical Articles',
            description: 'Discover the latest articles about your condition. The more you know, the healthier you stay.'
        },
        {
            href: '/hospital',
            icon: faHospital,
            title: 'Hospitals',
            description: 'Locate hospitals in your area and connect with professionals to validate your condition.'
        }
    ];

    return (
        <div className="lg:absolute relative bottom-1 left-1/2 transform -translate-x-1/2 w-full max-w-6xl z-20 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        href={feature.href}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturesSection;