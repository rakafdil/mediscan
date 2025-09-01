// pages/LandingPage.jsx or components/LandingPage.jsx
'use client'

import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import VideoSection from './components/VideoSection';
import TechBehindSection from './components/TechBehindSection';
import CareAroundSection from './components/CareAroundSection';
import KnowledgeIsCareSection from './components/KnowledgeIsCareSection';

const Home = () => {
  return (
    <section>
      <div>
        {/* Hero Section with overlaid Features */}
        <div className="relative">
          <HeroSection />
          <FeaturesSection />
        </div>

        {/* Video Section */}
        <VideoSection />

        {/* The Tech Behind mediScan Section */}
        <TechBehindSection />

        {/* Care Around You Section */}
        <CareAroundSection />

        {/* Knowledge is Care Section */}
        <KnowledgeIsCareSection />
      </div>
    </section>
  );
};

export default Home;