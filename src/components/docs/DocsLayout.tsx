import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { 
  Book, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  FileText, 
  Zap, 
  Shield, 
  Code,
  Globe,
  Settings
} from 'lucide-react';
import { NavbarDemo } from '../Navbar';

interface DocsLayoutProps {
  children: React.ReactNode;
}

const DOCS_NAV = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quickstart Guide", href: "/docs/quickstart" },
      { title: "Core Philosophy", href: "/docs/philosophy" },
    ]
  },
  {
    title: "SaaS Intelligence",
    items: [
      { title: "Analysis Engine", href: "/docs/analysis-engine" },
      { title: "Strategic Tokens", href: "/docs/strategic-tokens" },
      { title: "Market Mapping", href: "/docs/market-mapping" },
    ]
  },
  {
    title: "Enterprise",
    items: [
      { title: "Security & Compliance", href: "/docs/security" },
      { title: "Custom Deployment", href: "/docs/deployment" },
      { title: "SLA Guarantee", href: "/docs/sla" },
    ]
  }
];

export const DocsLayout: React.FC<DocsLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <NavbarDemo hideDashboard />
      
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-24 flex gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 pr-8 space-y-8 h-[calc(100vh-160px)] sticky top-32 overflow-y-auto scrollbar-none">
          {DOCS_NAV.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                {section.title}
              </h4>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm py-1.5 transition-colors flex items-center gap-2 group",
                      pathname === item.href 
                        ? "text-blue-500 font-semibold" 
                        : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3 h-3 transition-transform",
                      pathname === item.href ? "rotate-90 text-blue-500" : "group-hover:translate-x-1"
                    )} />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20 text-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <aside 
              className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-950 p-8 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Documentation</h2>
                <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              {DOCS_NAV.map((section) => (
                <div key={section.title} className="mb-8 last:mb-0">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                    {section.title}
                  </h4>
                  <nav className="flex flex-col gap-3">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "text-base transition-colors",
                          pathname === item.href ? "text-blue-500 font-bold" : "text-neutral-500"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {children}
        </main>
      </div>
    </div>
  );
};
