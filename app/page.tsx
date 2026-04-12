import { Suspense } from 'react'
import { Footer } from "@/components/Footer";

import { FeaturesSection } from "@/components/Home/FeaturesSection";
import { AnimatedTestimonialsDemo } from "@/components/Home/AnimatedTestimonialsDemo";
import { HomePageInteractive, CTAInteractive } from "@/components/Home/HomePageInteractive";
import { HowItWorks } from "@/components/Home/HowItWorks";
import { FAQSection } from "@/components/Home/FAQSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black overflow-hidden">
      <Suspense fallback={null}>
        <HomePageInteractive />
      </Suspense>
      
      <HowItWorks />
      
      <FeaturesSection />
      
      <AnimatedTestimonialsDemo />
      
      <FAQSection />
      
      <Suspense fallback={null}>
        <CTAInteractive />
      </Suspense>
      
      <Footer />
    </main>
  );
}
