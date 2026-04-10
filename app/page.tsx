import { Suspense } from 'react'
import { Footer } from "@/components/Footer";

import { FeaturesSection } from "@/components/Home/FeaturesSection";
import { AnimatedTestimonialsDemo } from "@/components/Home/AnimatedTestimonialsDemo";
import { HomePageInteractive, CTAInteractive } from "@/components/Home/HomePageInteractive";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black overflow-hidden">
      <Suspense fallback={null}>
        <HomePageInteractive />
      </Suspense>
      
      
      <FeaturesSection />
      
      <AnimatedTestimonialsDemo />
      
      <Suspense fallback={null}>
        <CTAInteractive />
      </Suspense>
      
      <Footer />
    </main>
  );
}
