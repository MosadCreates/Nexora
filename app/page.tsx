'use client'

import { useAuth } from "@/context/AuthContext";
import { NavbarDemo } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/Home/HeroSection";
import { TrustedBy } from "@/components/Home/TrustedBy";
import { FeaturesSection } from "@/components/Home/FeaturesSection";
import { AnimatedTestimonialsDemo } from "@/components/Home/AnimatedTestimonialsDemo";
import { CTASection } from "@/components/Home/CTASection";
import { useRouter } from "next/navigation";

export default function Home() {
  const { session, profile } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white dark:bg-black overflow-hidden">
      <NavbarDemo
        session={session}
        profile={profile}
        credits={undefined}
      />
      
      <HeroSection 
        onGetStarted={() => {
          if (session) {
            router.push('/analysis?new=true');
          } else {
            router.push('/signup');
          }
        }} 
      />
      
      <TrustedBy />
      
      <FeaturesSection />
      
      <AnimatedTestimonialsDemo />
      
      <CTASection 
        authenticated={!!session}
        onAction={() => {
          if (session) {
            router.push('/analysis?new=true');
          } else {
            router.push('/signup');
          }
        }}
      />
      
      <Footer />
    </main>
  );
}
