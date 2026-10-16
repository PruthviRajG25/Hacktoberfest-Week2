import React from 'react';
import {
  Sparkles,
  PlusCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Database,
  Cpu
} from 'lucide-react';
import { Logo } from './Logo';
import { ReadinessResponse } from '../types';

interface SiteBannerProps {
  onNavigateTab: (tab: string) => void;
  readiness?: ReadinessResponse | null;
  savedCount?: number;
  compact?: boolean;
}

export const SiteBanner: React.FC<SiteBannerProps> = ({
  onNavigateTab,
  readiness,
  savedCount = 0,
  compact = false,
}) => {
  const isAiOnline = readiness?.ai_provider_ready ?? false;
  const isAtlas = readiness?.database_type === 'mongodb_atlas';

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-4 sm:p-5 shadow-lg border border-indigo-700/50">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size="sm" theme="light" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">Open List</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/20">
                  Open-Weight AI
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                SEO-optimized, fact-grounded listings for Etsy, eBay &amp; Instagram
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onNavigateTab('logo')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Logo &amp; Brand</span>
            </button>
            <button
              onClick={() => onNavigateTab('create')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-700" />
              <span>New Listing</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-7 sm:p-10 shadow-2xl border border-indigo-900/60">
      {/* Background radial glows and subtle grid */}
      <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-3xl space-y-5">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-indigo-200">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAiOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAiOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-semibold">Open-Weight AI</span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-white">{readiness?.ai_model || 'gemma3:1b'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Hallucination Guardrails</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-sky-200">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAtlas ? 'MongoDB Atlas' : 'In-Memory Store'}</span>
          </div>
        </div>

        {/* Brand Lockup with Logo */}
        <div className="flex items-center gap-4 pt-1">
          <Logo variant="icon" size="lg" theme="light" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                Open <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">List</span>
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Studio
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium mt-1">
              AI-Powered Ecommerce Listing Generator for Independent Sellers
            </p>
          </div>
        </div>

        {/* Headline & Description */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Transform raw product specifications into high-converting titles, bullet-point specs, 
          rich search keywords, and engaging social hooks with strict factuality. Engineered for Etsy artisans, eBay stores, Instagram boutiques, and local retailers.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('create')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-sm shadow-lg shadow-indigo-950/40 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4 text-indigo-700" />
            <span>Create New Listing</span>
          </button>

          <button
            onClick={() => onNavigateTab('saved')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-sm font-semibold transition-all backdrop-blur-sm"
          >
            <FileText className="w-4 h-4 text-indigo-300" />
            <span>Browse Saved ({savedCount})</span>
          </button>

          <button
            onClick={() => onNavigateTab('logo')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600/40 to-purple-600/40 hover:from-indigo-600/60 hover:to-purple-600/60 text-indigo-200 hover:text-white border border-indigo-500/30 text-sm font-semibold transition-all"
          >
            <ImageIcon className="w-4 h-4 text-purple-300" />
            <span>Official Logo &amp; Banners</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteBanner;
