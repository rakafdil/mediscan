import type { Metadata } from "next";
import { Josefin_Sans, Montserrat } from "next/font/google";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ThemeSwitch from "./components/ThemeSwitch";
import "./globals.css";
import { DarkModeProvider } from "./ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-josefin",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "MediScan",
  description: "Scanning Your Health",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${josefin.variable} ${montserrat.variable} antialiased`}>
        <DarkModeProvider>
        <Navbar />
        <main>
          {children}
        </main>
        <ThemeSwitch />
        <Footer />
        </DarkModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
