import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);
import HeroSection from "../app/components/HeroSection";

test("renders 'Start Scan Now' button with correct link", () => {
    render(<HeroSection />);
    const startScanLink = screen.getByRole("link", { name: /start scan now/i });
    expect(startScanLink.getAttribute("href")).toBe("/symptom-checker");
});
