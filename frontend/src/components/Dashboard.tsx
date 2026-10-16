import React from 'react';
import {
  Sparkles,
  PlusCircle,
  FileText,
  Clock,
  ExternalLink,
  Tag,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  ShoppingBag,
  Check
} from 'lucide-react';
import { ListingDocument, ReadinessResponse, SamplePreset } from '../types';

interface DashboardProps {
  listings: ListingDocument[];
  readiness: ReadinessResponse | null;
  samplePresets: SamplePreset[];
  onSelectPreset: (preset: SamplePreset) => void;
  onNavigateTab: (tab: string) => void;
  onViewListing: (listing: ListingDocument) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  listings,
  readiness,
  samplePresets,
  onSelectPreset,
  onNavigateTab,
  onViewListing,
}) => {
  const isAiOnline = readiness?.ai_provider_ready ?? false;
  const isAtlas = readiness?.database_type === 'mongodb_atlas';
  const recentListings = listings.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 sm:p-10 shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Open-Weight AI • Gemma 3 Powered</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Transform product specs into professional ecommerce listings.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Generate SEO titles, compelling descriptions, search tags, and social captions with strict factuality. Built for Etsy artisans, eBay sellers, Instagram boutiques, and local retailers.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('create')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 text-indigo-700" />
              <span>Create New Listing</span>
            </button>
            <button
              onClick={() => onNavigateTab('saved')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-800/60 hover:bg-indigo-800/90 text-white border border-indigo-700/50 text-sm font-medium transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Browse Saved ({listings.length})</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/4 bottom-0 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Saved Listings</p>
            <p className="text-2xl font-bold text-slate-900">{listings.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Persisted in MongoDB</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inference Engine</p>
            <p className="text-lg font-bold text-slate-900 font-mono truncate">
              {readiness?.ai_model || 'gemma3:1b'}
            </p>
            <p className="text-xs flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${isAiOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={isAiOnline ? 'text-emerald-700' : 'text-amber-700 font-medium'}>
                {isAiOnline ? 'Ollama Online' : 'Offline / Standby'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Database Layer</p>
            <p className="text-lg font-bold text-slate-900">
              {isAtlas ? 'MongoDB Atlas' : 'Local In-Memory'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAtlas ? 'Vector Search Ready' : 'Atlas connection optional'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick-Start Sample Products */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Quick-Start Sample Products</span>
            </h2>
            <p className="text-sm text-slate-500">
              One-click templates to test AI generation instantly without typing product specs.
            </p>
          </div>
          <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full w-fit">
            Ready for Demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {samplePresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="group p-4 rounded-xl border border-slate-200/70 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                    {preset.marketplace}
                  </span>
                  <span className="font-medium text-slate-600">${preset.price} {preset.currency}</span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {preset.product_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {preset.features_and_specs}
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-indigo-600">
                <span>Load in Generator</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span>Recent Listing Activity</span>
            </h2>
            <p className="text-sm text-slate-500">Previously generated listings and demo records.</p>
          </div>
          <button
            onClick={() => onNavigateTab('saved')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentListings.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No listings generated yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Select one of the quick-start products above or create your own custom listing.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentListings.map((item) => (
              <div
                key={item._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2.5 rounded-xl transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {item.product_input.product_name}
                    </span>
                    {item.is_sample && (
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">
                        Sample
                      </span>
                    )}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-indigo-600 font-medium">
                      {item.product_input.marketplace}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {item.generated_listing.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewListing(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition-all"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
