"use client";

import React from "react";
import { TracingBeam } from "./ui/aceternity/tracing-beam";
import { Sparkles, ShieldCheck, Lock, Globe, Zap, Database, UserCheck, ArrowLeft, Scale, Info, Users, CreditCard, ShieldAlert } from "lucide-react";
import { BackgroundBeams } from "./ui/aceternity/background-beams";
import { TextGenerateEffect } from "./ui/aceternity/text-generate-effect";
import { Highlight } from "./ui/aceternity/hero-highlight";
import { CardSpotlight } from "./ui/aceternity/card-spotlight";
import Link from "next/link";

export const Terms: React.FC = () => {
  const subtitle = `Please read these Terms carefully before using our platform.`;

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
              <Scale className="w-4 h-4" />
              <span>Legal Framework v2.1.0</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black dark:text-white mb-6">
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">Service</span>
            </h1>
            
            <div className="mb-4">
              <TextGenerateEffect words={subtitle} className="text-xl md:text-2xl font-semibold text-neutral-800 dark:text-neutral-200" />
            </div>
            
            <p className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2 justify-center md:justify-start">
              <span>Effective Date: March 14, 2026</span>
            </p>
          </header>

          <section className="mb-16 p-8 rounded-3xl border-2 border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-black dark:text-white flex items-center gap-2 m-0 uppercase tracking-widest">
                <ShieldAlert className="w-5 h-5 text-blue-500" />
                Important — Legal Agreement
              </h3>
              <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                By creating an account or using any feature of Nexora, you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 leading-relaxed italic">
                If you are using Nexora on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms. If you do not agree, do not access the platform.
              </p>
            </div>
          </section>

          {termsContent.map((item, index) => (
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
                    Strategic Framework
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    Committed to business excellence and legal clarity.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-500">
                  <p className="font-bold text-xl text-black dark:text-white mb-3">Legal Enquiries</p>
                  <a href="mailto:legal@nexora.ai" className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors block mb-2">
                    legal@nexora.ai
                  </a>
                  <p className="text-sm text-neutral-500">Estimated response: 5 business days.</p>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 shadow-2xl hover:shadow-cyan-500/10 transition-shadow duration-500">
                  <p className="font-bold text-xl text-black dark:text-white mb-3">Privacy Integrity</p>
                  <a href="mailto:privacy@nexora.ai" className="text-xl font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors block mb-2">
                    privacy@nexora.ai
                  </a>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 tracking-wider uppercase font-medium">
                <p>© 2026 NEXORA. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6">
                   <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </TracingBeam>
    </div>
  );
};

const termsContent = [
  {
    badge: "01",
    icon: <Info className="w-6 h-6 text-blue-500" />,
    title: "Definitions",
    description: (
      <div className="space-y-4">
        <p>The following terms define our operational relationship:</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { t: "Platform", d: "The Nexora web application, AI engine, and APIs." },
            { t: "Intelligence Query", d: "Inputs submitted by you to trigger AI research." },
            { t: "Intelligence Report", d: "The AI-generated output (Weakness Matrices, etc.) delivered in response." },
            { t: "Credits", d: "Unit of consumption tracking plan usage limits." }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
              <div className="font-bold text-black dark:text-white min-w-[120px]">{item.t}</div>
              <div className="text-sm text-neutral-500">{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    badge: "02",
    icon: <Users className="w-6 h-6 text-green-500" />,
    title: "Eligibility & Registration",
    description: (
      <div className="space-y-4">
        <p><strong>Eligibility:</strong> You must be at least 18 years of age and representing a business or professional entity to use Nexora.</p>
        <p><strong>Account Security:</strong> You are responsible for keeping credentials confidential. Notify us at legal@nexora.ai for unauthorized access.</p>
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-sm italic text-amber-600 dark:text-amber-400">
           "One Account Per User: Creating multiple accounts to circumvent credit limits is a material breach of these terms."
        </div>
      </div>
    ),
  },
  {
    badge: "03",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Platform & AI Content",
    description: (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20">
          <h4 className="font-bold text-black dark:text-white mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-500" />
            AI-Generated Content Disclaimer
          </h4>
          <p className="text-sm leading-relaxed">
            Intelligence Reports are generated by AI for informational purposes only. They do NOT constitute legal, financial, or professional advice. AI outputs may contain inaccuracies; you are responsible for independent verification.
          </p>
        </div>
        <p>We reserve the right to modify features at any time. Material reductions in functionality will be notified 14 days in advance.</p>
      </div>
    ),
  },
  {
    badge: "04",
    icon: <CreditCard className="w-6 h-6 text-purple-500" />,
    title: "Subscriptions & Billing",
    description: (
      <div className="space-y-4">
        <p><strong>Polar.sh Integration:</strong> All payments are processed by Polar.sh, our merchant of record. Prices are exclusive of taxes.</p>
        <p><strong>Credit Reset:</strong> Credits reset each billing period and do not carry forward. Exceeding limits will suspend generation until the next cycle or upgrade.</p>
        <p><strong>Refunds:</strong> Fees are generally non-refundable except for verifiable outages (&gt;24h) or clear billing errors reported within 14 days.</p>
      </div>
    ),
  },
  {
    badge: "05",
    icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
    title: "Acceptable Use Policy",
    description: (
      <div className="space-y-4">
        <p>Prohibited activities include:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm italic">
          <li>Submitting personal data (PII) in queries.</li>
          <li>Surveillance or harassment of individuals.</li>
          <li>Reverse-engineering the AI model or proprietary algorithms.</li>
          <li>Circumventing credit limits via bots or scraping.</li>
        </ul>
      </div>
    ),
  },
  {
    badge: "06",
    icon: <Globe className="w-6 h-6 text-cyan-500" />,
    title: "Intellectual Property",
    description: (
      <div className="space-y-4">
        <p><strong>Our Tech:</strong> Nexora owns all software, AI models, and branding.</p>
        <p><strong>Your Content:</strong> You retain ownership of your queries. You grant us a limited licence to process them solely to deliver your reports.</p>
        <p><strong>Report Usage:</strong> You may share reports internally. You may NOT resell report outputs as a standalone service.</p>
      </div>
    ),
  },
  {
    badge: "07",
    icon: <Lock className="w-6 h-6 text-blue-400" />,
    title: "Data Commitments",
    description: (
      <div className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <p className="font-bold text-black dark:text-white mb-2">Zero AI Training</p>
        <p className="text-sm">Your queries and reports are NEVER used to train or fine-tune AI models, including Anthropic Claude.</p>
      </div>
    ),
  },
];

export default Terms;
