'use client';

import { useAuth } from "@/context/AuthContext";
import { NavbarDemo } from "@/components/Navbar";
import { HeroSection } from "@/components/Home/HeroSection";
import { CTASection } from "@/components/Home/CTASection";
import { useRouter } from "next/navigation";

export function HomePageInteractive() {
  const { session, profile } = useAuth();
  const router = useRouter();

  return (
    <>
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
    </>
  );
}

export function CTAInteractive() {
  const { session } = useAuth();
  const router = useRouter();

  return (
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
  );
}
