'use client'

import React from 'react'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import { CardSpotlight } from '@/components/ui/aceternity/card-spotlight'
import { Button as MovingBorderButton } from '@/components/ui/aceternity/moving-border'
import { Button } from '@/components/ui/button'
import { AnimatedTooltip } from '@/components/ui/aceternity/animated-tooltip'
import { TracingBeam } from '@/components/ui/aceternity/tracing-beam'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Globe, ArrowRight, CheckCircle, Shield, Zap, BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const EXAMPLES = [
  {
    title: "SaaS Battleground",
    description: "Deep dive into the productivity space. How Notion maintains its edge against Obsidian and Roam Research.",
    metrics: ["Pricing Tiers", "Feature Velocity", "User Sentiment"],
    brands: [
      { id: 1, name: "Notion", designation: "All-in-one workspace", image: "https://www.google.com/s2/favicons?domain=notion.so&sz=128" },
      { id: 2, name: "n8n", designation: "Workflow Automation", image: "https://www.google.com/s2/favicons?domain=n8n.io&sz=128" },
      { id: 3, name: "Microsoft", designation: "Enterprise Software", image: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128" }
    ],
    color: "#3b82f6"
  },
  {
    title: "E-commerce Pulse",
    description: "Global sportswear giants analyzed. Market share shifts and direct-to-consumer strategy comparison.",
    metrics: ["Market Share", "Search Volume", "Ad Spend"],
    brands: [
      { id: 4, name: "Google", designation: "Search & Advertising", image: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
      { id: 5, name: "GitHub", designation: "Development Platform", image: "https://www.google.com/s2/favicons?domain=github.com&sz=128" },
      { id: 6, name: "Reddit", designation: "Community Insights", image: "https://www.google.com/s2/favicons?domain=reddit.com&sz=128" }
    ],
    color: "#06b6d4"
  },
  {
    title: "Local Brand Intelligence",
    description: "Specialty coffee landscape in London. Identifying gaps in the high-end artisan market.",
    metrics: ["Location Density", "Review Ratings", "Foot Traffic"],
    brands: [
      { id: 7, name: "OpenAI", designation: "Artificial Intelligence", image: "https://www.google.com/s2/favicons?domain=openai.com&sz=128" },
      { id: 8, name: "Slack", designation: "Team Communications", image: "https://www.google.com/s2/favicons?domain=slack.com&sz=128" },
      { id: 9, name: "n8n", designation: "Integration Engine", image: "https://www.google.com/s2/favicons?domain=n8n.io&sz=128" }
    ],
    color: "#6366f1"
  }
]

const TRACING_CONTENT = [
  {
    badge: "Market Analysis",
    title: "Real-time Competitor Product Benchmarking",
    description: (
      <div className="space-y-4">
        <p>
          Nexora's intelligence engine automatically tracks product updates, pricing changes, and feature launches across your entire competitive landscape. Our proprietary AI models analyze release notes, social signals, and public documentation to give you a 360-degree view.
        </p>
        <p>
         In our recent SaaS benchmark, we identified a 15% increase in feature parity across productivity tools, suggesting a market shift towards ecosystem integration rather than standalone feature dominance.
        </p>
      </div>
    ),
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3"
  },
  {
    badge: "Consumer Sentiment",
    title: "Deep Sentiment & Brand Perception Tracking",
    description: (
      <div className="space-y-4">
        <p>
          Understand the 'Why' behind consumer choices. Nexora monitors millions of conversation points across Reddit, Twitter, and niche forums to map emotional connection and brand loyalty.
        </p>
        <p>
          For the E-commerce sector, sentiment data revealed that 'Sustainability' is now the #1 driver for Gen Z sportswear purchases, surpassing 'Performance' for the first time in Nike's core demographic.
        </p>
      </div>
    ),
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3"
  },
  {
    badge: "Strategic Gaps",
    title: "Predictive Intelligence: Identifying Market Vacuums",
    description: (
      <div className="space-y-4">
        <p>
          Nexora doesn't just show you what is happening; it predicts what is next. By analyzing market saturation and unmet consumer needs, our AI identifies "Blue Ocean" opportunities for your brand.
        </p>
        <p>
          Our latest report on the specialty coffee market identified a significant gap in 'Subscription-first Artisan Experiences' within the London metro area, providing a roadmap for upcoming challenger brands.
        </p>
      </div>
    ),
    image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=2306&ixlib=rb-4.0.3"
  }
]

export default function ExamplesContent() {
  const { session } = useAuth()
  const ctaLink = session ? '/analysis?new=true' : '/signup'

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-20 overflow-x-hidden">
      {/* Hero Section with BackgroundBeams - Matched to Home style */}
      <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center">
        <BackgroundBeams className="opacity-40" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-8 tracking-tight">
                    Intelligence in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Action</span>
                </h1>
                <div className="max-w-2xl mx-auto">
                    <TextGenerateEffect 
                        words="Explore real-world competitor analysis reports generated by Nexora. See how top brands stay ahead of the curve."
                        className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl"
                    />
                </div>
            </motion.div>
        </div>
      </div>

      {/* Tracing Beam Section */}
      <div className="py-32 bg-white dark:bg-black relative">
         <div className="max-w-7xl mx-auto px-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-4">
                The Nexora <span className="text-blue-500">Methodology</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
                Our approach combines deep data extraction with sophisticated AI modeling to deliver actionable intelligence.
            </p>
         </div>

         <TracingBeam className="px-6">
            <div className="max-w-4xl mx-auto antialiased relative">
                {TRACING_CONTENT.map((item, index) => (
                    <div key={`content-${index}`} className="mb-24">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold px-3 py-1 uppercase tracking-wider">
                                {item.badge}
                            </span>
                            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-6">
                            {item.title}
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            <div className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-4">
                                {item.description}
                                <Link href={ctaLink} className="flex items-center gap-2 text-blue-500 font-bold mt-6 group">
                                    Deep Dive Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 w-full h-[250px] md:h-[400px] object-cover shadow-2xl"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </TracingBeam>
      </div>

      {/* Grid Highlights Section */}
      <div className="max-w-7xl mx-auto px-4 py-32 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-4">
                Analysis <span className="text-blue-500">Snapshots</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
                Quick insights from across different industry sectors.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {EXAMPLES.map((example, index) => (
            <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
            >
                <CardSpotlight 
                className="p-8 h-full flex flex-col group/card"
                color={example.color}
                >
                <div className="relative z-20">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-transform"
                        style={{ backgroundColor: `${example.color}20`, color: example.color }}
                    >
                        {index === 0 ? <Globe className="w-6 h-6" /> : index === 1 ? <TrendingUp className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">
                        {example.title}
                    </h3>
                    
                    <p className="text-neutral-400 mb-6 leading-relaxed">
                        {example.description}
                    </p>

                    <div className="space-y-3 mb-8">
                        {example.metrics.map(metric => (
                            <div key={metric} className="flex items-center gap-2 text-sm text-neutral-300">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                {metric}
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">
                        Analyzed Brands
                    </p>
                    <div className="flex flex-row items-center justify-start w-full">
                        <AnimatedTooltip items={example.brands} />
                    </div>
                    </div>

                </div>
                </CardSpotlight>
            </motion.div>
            ))}
        </div>
      </div>

      {/* Closing CTA - Requested Modern Design */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="relative isolate overflow-hidden bg-neutral-100 dark:bg-neutral-900/50 rounded-[3rem] border border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-4 py-10 md:flex-row md:px-12 md:py-16 gap-8">
            <div className="flex flex-col">
              <h2 className="mx-auto max-w-xl text-center text-2xl font-bold text-black md:mx-0 md:text-left md:text-5xl dark:text-white leading-tight">
                Master your market with <br />
                Nexora intelligence today.
              </h2>
              <p className="mx-auto mt-8 max-w-md text-center text-sm text-neutral-600 md:mx-0 md:text-left md:text-base dark:text-neutral-400">
                Join 27,000+ creators and businesses using Nexora to stay 10 steps ahead. Get actionable insights that drive real growth.
              </p>
              
              <div className="mt-10 mb-10 flex flex-col items-center md:items-start">
                <div className="mb-2 flex flex-col items-center justify-start lg:justify-start gap-3">
                  <div className="flex flex-row items-center">
                    <AnimatedTooltip 
                      isLogo={false}
                      items={[
                        { id: 1, name: "John Doe", designation: "Founder, TechFlow", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" },
                        { id: 2, name: "Robert Johnson", designation: "Performance Lead, Nike", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" },
                        { id: 3, name: "Jane Smith", designation: "Growth @ Shopify", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" },
                        { id: 4, name: "Emily Davis", designation: "Strategist, Adidas", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" },
                        { id: 5, name: "Tyler Durden", designation: "Project Manager", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" },
                        { id: 6, name: "Dora", designation: "Product Lead", image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=100" },
                      ]} 
                    />
                  </div>
                  <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.svg 
                        key={i} 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 16 16" 
                        className="mx-0.5 h-4 w-4 text-yellow-400" 
                        height="1em" 
                        width="1em" 
                        xmlns="http://www.w3.org/2000/svg"
                        whileHover={{ scale: 1.2 }}
                      >
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"></path>
                      </motion.svg>
                    ))}
                  </motion.div>
                </div>
                <p className="relative z-40 text-sm text-neutral-500 dark:text-neutral-400 lg:text-left text-center">Trusted by 27,000+ businesses</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-10 md:mt-0 items-center justify-center">
                <Link href={ctaLink} className="w-full md:w-64">
                    <Button 
                        className="w-full h-14 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full"
                    >
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <Link href="/contact" className="w-full md:w-64">
                    <Button 
                        variant="outline" 
                        className="w-full h-14 text-lg font-bold border-2 border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full bg-transparent transition-all"
                    >
                        Talk to an Expert
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
