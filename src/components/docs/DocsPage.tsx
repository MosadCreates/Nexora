import React from 'react';
import { usePathname } from 'next/navigation';
import { DocsLayout } from './DocsLayout';
import { ComponentPreview } from './ComponentPreview';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Shield, 
  ArrowRight,
  Info,
  Layers,
  Search,
  CheckCircle,
  TrendingUp,
  Cpu,
  BarChart,
  Network,
  Globe,
  Database,
  Lock,
  MessageSquare,
  Rocket,
  Activity
} from 'lucide-react';

export const DocsPage: React.FC = () => {
  const pathname = usePathname();
  const slug = pathname.replace('/docs', '').replace('/', '');

  const renderContent = () => {
    switch (slug) {
      case 'quickstart':
        return <QuickstartDocs />;
      case 'philosophy':
        return <PhilosophyDocs />;
      case 'analysis-engine':
        return <AnalysisEngineDocs />;
      case 'strategic-tokens':
        return <StrategicTokensDocs />;
      case 'market-mapping':
        return <MarketMappingDocs />;
      case 'security':
        return <SecurityDocs />;
      case 'deployment':
        return <DeploymentDocs />;
      case 'sla':
        return <SlaDocs />;
      default:
        return <IntroductionDocs />;
    }
  };

  return (
    <DocsLayout>
      {renderContent()}
    </DocsLayout>
  );
};

/* --- Content Components --- */

const IntroductionDocs = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <div className="flex items-center gap-2 text-blue-500 font-bold tracking-tighter text-sm uppercase">
        <Sparkles className="w-4 h-4" />
        <span>Documentation v1.0</span>
      </div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        System Intelligence Guide
      </h1>
      <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Nexora is a high-performance, Claude-integrated platform designed for deep competitive intelligence. We move beyond simple "keyword tracking" into multidimensional market synthesis.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
        <Cpu className="w-6 h-6 text-blue-500 mb-4" />
        <h3 className="font-bold mb-2">Multi-Agent Intelligence</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Our swarm of specialized agents (Researcher, Critic, Synthesizer) work in parallel to decode market signals.</p>
      </div>
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
        <TrendingUp className="w-6 h-6 text-emerald-500 mb-4" />
        <h3 className="font-bold mb-2">Predictive Drift</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Identify not just where your competitors are, but where they are drifting based on latent landing page changes.</p>
      </div>
    </div>

    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Core Modules</h2>
      <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-7">
        <p>
          Nexora architecture is built on three core pillars of data integrity and strategic foresight. Each report you generate is the result of thousands of micro-heuristics processed in real-time.
        </p>
        <ul className="list-none space-y-3">
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <span><strong>Strategic Scans:</strong> Advanced web-crawling that bypasses simple scraping to understand the *intent* behind competitor product updates.</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <span><strong>Neural Clustering:</strong> Categorizing competitor weaknesses into actionable vectors like Pricing Arbitrage, Technical Debt, or Feature Fatigue.</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <span><span><strong>Synthesis Index:</strong> A proprietary scoring system (0-100) that measures the operational threat of a competitor relative to your specific market position.</span></span>
          </li>
        </ul>
      </div>
    </section>

    <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex items-start gap-4">
      <Info className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
      <div>
        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">New to Nexora?</h4>
        <p className="text-sm text-blue-800/70 dark:text-blue-200/60 leading-relaxed">
          Start by launching a <strong>Deep Analysis</strong> on your profile page. Each scan requires 1 Strategic Token. Free accounts start with 3 tokens to test the full power of the Foresight Engine.
        </p>
      </div>
    </div>
  </div>
);

const AnalysisEngineDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Analysis Engine
      </h1>
      <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Our Claude-powered analysis pipeline is designed for hyper-accuracy. Unlike traditional tools, we analyze the semantic structure of the entire competitor ecosystem.
      </p>
    </header>

    <section className="space-y-6">
      <h2 className="text-2xl font-bold">The Three-Phase Scan</h2>
      <div className="relative border-l-2 border-blue-500/20 ml-4 space-y-12 py-4">
        <div className="relative pl-8">
          <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-black" />
          <h3 className="font-bold text-lg mb-2">Phase 1: Deep Researching</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Agents deploy to external nodes to gather data on the target competitor. This includes public marketing claims, pricing tables, changelog history, and social sentiment triggers. We use advanced LLM-context window manipulation to ensure we don't miss "hidden" strategy shifts.
          </p>
        </div>
        <div className="relative pl-8">
          <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-black" />
          <h3 className="font-bold text-lg mb-2">Phase 2: Semantic Clustering</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The raw data is processed through our semantic transformer. We look for "Weakness Signatures"—patterns in competitor behavior that indicate technical struggle, customer dissatisfaction, or pricing misalignment.
          </p>
        </div>
        <div className="relative pl-8">
          <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-black" />
          <h3 className="font-bold text-lg mb-2">Phase 3: Strategic Scoring</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The final output is generated with a Focus on actionable intel. We calculate a **Vulnerability Score** (0-100) and provide a roadmap for exploitation.
          </p>
        </div>
      </div>
    </section>

    <section className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-500" /> Technical Accuracy
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        We maintain a 99.8% semantic accuracy rate by cross-verifying agent findings against three independent Claude nodes before final synthesis.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tokenization", val: "128k" },
          { label: "Latency", val: "1.2s" },
          { label: "Stability", val: "99.9%" },
          { label: "Nodes", val: "24" }
        ].map(stat => (
          <div key={stat.label} className="text-center p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-black/40">
            <div className="text-xs text-neutral-500 uppercase font-black mb-1">{stat.label}</div>
            <div className="text-lg font-bold text-blue-500">{stat.val}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const StrategicTokensDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Strategic Tokens
      </h1>
      <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Understand the economy of your intelligence. Every operation in Nexora is powered by a credit system called Strategic Tokens.
      </p>
    </header>

    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Mechanics</h2>
      <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 flex items-start gap-4">
        <Zap className="w-8 h-8 text-yellow-500 mt-1" />
        <div>
          <h3 className="font-bold text-lg mb-2">1 Scan = 1 Token</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Running a "Deep Analysis" query against a competitor or market segment consumes exactly 1 token. This token covers the costs of multi-agent orchestration, high-context LLM token usage, and real-time researcher deployment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Monthly Reset
          </h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Tokens reset every month based on your billing cycle. Unused tokens (Free & Starter) do not roll over.</p>
        </div>
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <Rocket className="w-4 h-4 text-purple-500" /> Burst Mode
          </h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Pro and Enterprise accounts can "burst" beyond their limits with temporary credit top-ups available in the management portal.</p>
        </div>
      </div>
    </section>

    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Token Tiering</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 dark:border-neutral-800 uppercase text-[10px] font-black tracking-widest text-neutral-400">
            <tr>
              <th className="py-4 font-bold">Plan Tier</th>
              <th className="py-4 font-bold">Monthly Tokens</th>
              <th className="py-4 font-bold">Intelligence Depth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
            <tr>
              <td className="py-4 font-bold">Free</td>
              <td className="py-4">3</td>
              <td className="py-4"><span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-[10px]">BASIC</span></td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-blue-500">Starter</td>
              <td className="py-4">20</td>
              <td className="py-4"><span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px]">ESSENTIAL</span></td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-purple-500">Professional</td>
              <td className="py-4">60</td>
              <td className="py-4"><span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px]">FULL FORESIGHT</span></td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-amber-500">Enterprise</td>
              <td className="py-4">UNLIMITED</td>
              <td className="py-4"><span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white text-[10px]">QUANTUM DEPTH</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
);


const MarketMappingDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Strategic Market Mapping
      </h1>
      <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Visualize your position in the competitive landscape with our multi-vector mapping system. 
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Neural Sentiment Heatmaps</h2>
        <p className="text-neutral-500 dark:text-neutral-400 leading-7">
          We aggregate customer sentiment across social signals and landing page reviews to create a heatmap of competitor perception. This allows you to identify where a competitor is vulnerable to a "Trust Attack."
        </p>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Identify "Vaporware" Claims</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Detect Pricing Discontent</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Locate Feature Fatigue</li>
        </ul>
      </div>
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 flex items-center justify-center">
        <Network className="w-24 h-24 text-blue-500/20" />
      </div>
    </div>
  </div>
);

const SecurityDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Enterprise Security
      </h1>
      <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Intelligence is sensitive. We treat your search history and strategy notes with compartmentalized security.
      </p>
    </header>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { icon: Lock, title: "Zero-Knowledge Queries", desc: "Your search queries are encrypted at rest and never used for global model training." },
        { icon: Shield, title: "SOC2 Compliance", desc: "Our infrastructure follows strict security protocols for data handling and access logs." },
        { icon: Database, title: "Isolated DB Nodes", desc: "Enterprise accounts receive dedicated database instances to ensure logical data isolation." }
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <item.icon className="w-6 h-6 text-blue-500 mb-4" />
          <h3 className="font-bold mb-2">{item.title}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </section>
  </div>
);


const QuickstartDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Quickstart Guide
      </h1>
      <p className="text-xl text-neutral-500 dark:text-neutral-400">
        Get your first competitive analysis report in under 60 seconds.
      </p>
    </header>

    <div className="space-y-8">
      {[
        { step: "01", title: "Create your Account", desc: "Sign up at /signup. New accounts automatically receive 3 complimentary Strategic Tokens." },
        { step: "02", title: "Enter a Competitor", desc: "Go to the Analysis Hub and type in any URL (e.g., 'competitor.com')." },
        { step: "03", title: "Wait for Synthesis", desc: "Our agent swarm will initiate the 3-phase crawl. This typically takes 15-30 seconds." },
        { step: "04", title: "Review Insights", desc: "Explore the vulnerability scores, sentiment maps, and generated tactical recommendations." }
      ].map((item, i) => (
        <div key={i} className="flex gap-6 group">
          <div className="text-4xl font-black text-neutral-200 dark:text-white/5 group-hover:text-blue-500/20 transition-colors">{item.step}</div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PhilosophyDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Core Philosophy
      </h1>
    </header>
    <div className="space-y-6 text-neutral-600 dark:text-neutral-400 leading-8 text-lg">
      <p>
        At Nexora, we believe that <span className="text-blue-500 font-bold italic">Information is not Intelligence.</span>
      </p>
      <p>
        Most tools flood you with data—keyword volumes, backlink counts, and traffic estimates. While useful, these metrics don't tell you the most important thing: <strong>What is the competitor's next move?</strong>
      </p>
      <p>
        Our philosophy is built on <strong>Intent Detection</strong>. By analyzing the linguistic shifts in landing pages and marketing collateral, our AI models can identify if a competitor is pivoting, struggling with retention, or preparing for an aggressive pricing war.
      </p>
    </div>
  </div>
);


const DeploymentDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        Custom Deployment
      </h1>
    </header>
    <div className="p-8 bg-neutral-900 rounded-3xl space-y-4">
      <pre className="text-xs text-blue-400">
{`docker run -e NEXORA_KEY=... \\
  -e CLAUDE_STRICT_MODE=true \\
  nexora-cloud/intelligence-node:latest`}
      </pre>
      <p className="text-sm text-neutral-400 font-sans leading-relaxed">
        Enterprise customers can deploy Nexora nodes directly into their isolated VPCs. This ensures no data ever leaves your perimeter, while still benefiting from our global agent swarm architecture.
      </p>
    </div>
  </div>
);

const SlaDocs = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl border-b border-neutral-200 dark:border-neutral-800 pb-4">
        SLA Guarantee
      </h1>
    </header>
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <h3 className="font-bold mb-2">99.99% Uptime</h3>
          <p className="text-sm text-neutral-500">We guarantee high availability for our analysis engine, distributed across 8 global regions.</p>
        </div>
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <h3 className="font-bold mb-2">4 Hour Response</h3>
          <p className="text-sm text-neutral-500">Enterprise support tickets are prioritized with a guaranteed 4-hour initial response time.</p>
        </div>
      </div>
      <p className="text-neutral-500 dark:text-neutral-400 italic text-center text-sm border-t border-neutral-200 dark:border-neutral-800 pt-8">
        Last updated: February 2026.
      </p>
    </div>
  </div>
);
