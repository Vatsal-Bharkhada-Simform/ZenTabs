import type { Metadata } from "next";
import Nav from "@/components/features/landing/Nav";
import Hero from "@/components/features/landing/Hero";
import BentoFeatures from "@/components/features/landing/BentoFeatures";
import HowItWorks from "@/components/features/landing/HowItWorks";
import Testimonials from "@/components/features/landing/Testimonials";
import CtaStrip from "@/components/features/landing/CtaStrip";
import Footer from "@/components/features/landing/Footer";

export const metadata: Metadata = {
  title: "ZenTabs — Save, organise, and find every link",
  description:
    "ZenTabs is a personal bookmark manager with profiles, collections, and tag-based search. Keep your links where you can actually find them.",
};

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <BentoFeatures />
        <HowItWorks />
        <Testimonials />
        <CtaStrip />
      </main>
      <Footer />
    </>
  );
}