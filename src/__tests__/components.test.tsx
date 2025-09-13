import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import HeroSection from "../app/components/HeroSection";
import FeaturesSection from "../app/components/FeaturesSection";

test("renders 'Start Scan Now' button with correct link", () => {
    render(<HeroSection />);
    const startScanLink = screen.getByRole("link", { name: /start scan now/i });
    expect(startScanLink.getAttribute("href")).toBe("/symptom-checker");
});

test("renders FeaturesSection with all feature cards", () => {
    render(<FeaturesSection />);

    const smartHealth = screen.getByRole("link", { name: /smart health scanning/i });
    expect(smartHealth).toBeInTheDocument();
    expect(smartHealth.getAttribute("href")).toBe("/symptom-checker");

    const medicalArticles = screen.getByRole("link", { name: /medical articles/i });
    expect(medicalArticles).toBeInTheDocument();
    expect(medicalArticles.getAttribute("href")).toBe("/article");

    const hospitals = screen.getByRole("link", { name: /hospitals/i });
    expect(hospitals).toBeInTheDocument();
    expect(hospitals.getAttribute("href")).toBe("/hospital");
});

