"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "./ui/aceternity/tracing-beam";
import { Sparkles, ShieldCheck, Lock, Globe, Zap, Database, UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BackgroundBeams } from "./ui/aceternity/background-beams";
import { TextGenerateEffect } from "./ui/aceternity/text-generate-effect";
import { Highlight } from "./ui/aceternity/hero-highlight";
import { CardSpotlight } from "./ui/aceternity/card-spotlight";

export const Privacy: React.FC = () => {
  const subtitle = `Autonomous Market Intelligence — Built with Your Privacy by Design`;

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 relative overflow-hidden">
      <BackgroundBeams className="opacity-40" />
      
      <TracingBeam className="px-6 relative z-10">
        <div className="max-w-2xl mx-auto antialiased pt-4 relative">
          <div className='flex justify-start items-center mb-8'>
            <Link href='/' className='flex space-x-2 items-center group'>
              <ArrowLeft className='w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:-translate-x-1 transition-transform' />
              <span className='text-sm text-neutral-500 dark:text-neutral-400'>
                Back
              </span>
            </Link>
          </div>

          <header className="mb-20 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-pulse">
              <ShieldCheck className="w-4 h-4" />
              <span>Neural Integrity Verified</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black dark:text-white mb-6">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">Policy</span>
            </h1>
            
            <div className="mb-4">
              <TextGenerateEffect words={subtitle} className="text-xl md:text-2xl font-semibold text-neutral-800 dark:text-neutral-200" />
            </div>
            
            <p className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2 justify-center md:justify-start">
              <span>Effective Date: March 14, 2026</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="text-blue-500">v1.0.4</span>
            </p>
          </header>

          {privacyContent.map((item, index) => (
            <div key={`content-${index}`} className="mb-20 relative group">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-lg shadow-lg shadow-blue-500/5">
                  {item.badge}
                </div>
                <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
                  {item.icon}
                  {item.title}
                </h2>
              </div>

              <CardSpotlight className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shadow-xl group-hover:border-blue-500/30 transition-colors duration-500" color="rgba(59, 130, 246, 0.15)">
                <div className="text-base prose dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-none">
                  {item.description}
                </div>
              </CardSpotlight>
            </div>
          ))}

          <section className="mt-20 p-10 rounded-[40px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-2xl mb-32 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-3xl font-bold mb-3 text-black dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
                    Security Framework
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    Committed to absolute data sovereignty.
                  </p>
                </div>
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shadow-xl">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                     </div>
                   ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-500">
                  <p className="font-bold text-xl text-black dark:text-white mb-3">Privacy Integrity Team</p>
                  <a href="mailto:privacy@nexora.ai" className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors block mb-2">
                    privacy@nexora.ai
                  </a>
                  <p className="text-sm text-neutral-500">Global response time: 24-72 hours.</p>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 shadow-2xl hover:shadow-cyan-500/10 transition-shadow duration-500">
                  <p className="font-bold text-xl text-black dark:text-white mb-3">Formal Data Requests</p>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Subject Line: <span className="p-1 px-2 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-sm">[Privacy Request]</span>. We honor GDPR/CCPA rights globally.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 tracking-wider uppercase font-medium">
                <p>© 2026 NEXORA. AI-FIRST PRIVACY.</p>
                <div className="flex gap-6">
                   <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Audit Policy</a>
                   <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Neural Safeguards</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </TracingBeam>
    </div>
  );
};

const privacyContent = [
  {
    badge: "01",
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    title: "Introduction",
    description: (
      <div className="space-y-6">
        <p className="text-xl text-neutral-800 dark:text-neutral-200 leading-relaxed font-semibold font-outfit">
          Welcome to <Highlight className="text-black dark:text-white from-blue-500/30 to-cyan-500/30">Nexora</Highlight> — an Autonomous Market Intelligence platform built for the age of agentic research.
        </p>
        <p>
          This Privacy Policy explains what personal data we collect when you use our platform, why we collect it, how it is processed and stored, who we share it with, and what rights you hold over your information.
        </p>
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-sm italic">
          "Our architecture is designed with technical isolation at its core. Your strategic intent is your proprietary asset; we are merely the synthesis engine."
        </div>
      </div>
    ),
  },
  {
    badge: "02",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Capabilities & Scope",
    description: (
      <>
        <p className="mb-4">
          Nexora is a high-performance SaaS engine. Our platform enables users to:
        </p>
        <div className="grid grid-cols-1 gap-3 mt-6">
          {[
            { t: "Intelligence Query", d: "Submit competitor identities or market niches." },
            { t: "Autonomous Crawl", d: "Trigger AI swarms across Reddit, G2, and professional reviews." },
            { t: "Strategic Synthesis", d: "Generate Weakness Matrices and Opportunity Scores." }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
              <div className="mt-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <div>
                <p className="font-bold text-black dark:text-white">{item.t}</p>
                <p className="text-sm text-neutral-500">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    badge: "03",
    icon: <Database className="w-6 h-6 text-indigo-500" />,
    title: "Intelligence Data Handling",
    description: (
      <div className="space-y-6">
        <p>We apply the principle of <strong>Least-Data Processing</strong>. Every data vector is mapped to a specific functional requirement.</p>
        
        <div className="space-y-4 mt-6">
          {[
            {
              h: "Identity Verification",
              c: "Email and core profile metadata stored via Supabase Auth.",
              color: "blue"
            },
            {
              h: "Strategic Intent",
              c: "Intelligence queries and synthesized reports, secured via RLS.",
              color: "indigo"
            },
            {
              h: "Monetization Metadata",
              c: "Credit usage and subscription status, orchestrated by Polar.sh.",
              color: "cyan"
            }
          ].map((item, i) => (
            <div key={i} className="group relative p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 rounded-full bg-${item.color}-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]`} />
                <h4 className="font-bold text-black dark:text-white">{item.h}</h4>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 pl-5">{item.c}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    badge: "04",
    icon: <Sparkles className="w-6 h-6 text-blue-500" />,
    title: "Neural Integrity Architecture",
    description: (
      <div className="space-y-6">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-transparent border border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <h4 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            The Zero-Training Commitment
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { t: "Ephemeral Processing", d: "AI synthesis occurs on stateless nodes. No data is cached by Google for model training." },
              { t: "Cryptographic Isolation", d: "AES-256 encryption at rest. Multi-tenant isolation at the row level." },
              { t: "Read-Only Observability", d: "Our swarms read public discourse. They never publish your query or identity." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-sm">
                <div className="mt-1"><ShieldCheck className="w-5 h-5 text-blue-500" /></div>
                <div>
                  <p className="font-bold text-black dark:text-white">{item.t}</p>
                  <p className="text-sm text-neutral-500">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm italic text-neutral-500 text-center">
          "Strategic intelligence is only valuable if it remains confidential. Our stack proves it."
        </p>
      </div>
    ),
  },
  {
    badge: "05",
    icon: <UserCheck className="w-6 h-6 text-green-500" />,
    title: "Governance & Rights",
    description: (
      <div className="space-y-4">
        <p>We provide users with absolute control over their digital footprint. Our "Sovereignty Dashboard" allows for:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[
            { t: "Instant Export", d: "Retrieve all account data in JSON format." },
            { t: "Atomic Deletion", d: "Permanently wipe specific reports from history." },
            { t: "Cascade Erasure", d: "Complete account closure and data scrubbing." },
            { t: "Audit Logs", d: "Request detailed processing logs for your UID." }
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-default">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div>
                <p className="font-bold text-black dark:text-white text-sm">{item.t}</p>
                <p className="text-xs text-neutral-500 leading-snug">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default Privacy;
