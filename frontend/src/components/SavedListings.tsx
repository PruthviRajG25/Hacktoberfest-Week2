import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Tag,
  Download,
  AlertCircle,
  Database,
  Filter,
  Layers
} from 'lucide-react';
import { ListingDocument, GeneratedListing, ProductInput } from '../types';
import { api } from '../api';

interface SavedListingsProps {
  listings: ListingDocument[];
  onOpenListing: (listing: ListingDocument) => void;
  onDeleteListing: (id: string) => void;
  onExportListing: (listing: GeneratedListing, input: ProductInput) => void;
}

export const SavedListings: React.FC<SavedListingsProps> = ({
  listings,
  onOpenListing,
  onDeleteListing,
  onExportListing,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isSemanticSearching, setIsSemanticSearching] = useState<boolean>(false);
  const [semanticResults, setSemanticResults] = useState<{
    method: 'vector_search' | 'text_fallback';
    message: string;
    itemIds: string[];
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTitle = (id: string, title: string) => {
    navigator.clipboard.writeText(title);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSemanticResults(null);
      return;
    }

    setIsSemanticSearching(true);
    try {
      const res = await api.searchListings(searchQuery.trim(), 20);
      setSemanticResults({
        method: res.search_method,
        message: res.message,
        itemIds: res.results.map((r) => r.id),
      });
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSemanticResults(null);
  };

  // Filter listings based on standard search or semantic results
  let displayedListings = listings;
  if (semanticResults) {
    displayedListings = listings.filter((l) => semanticResults.itemIds.includes(l._id));
  } else if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedListings = listings.filter((l) => {
      const name = l.product_input.product_name.toLowerCase();
      const cat = l.product_input.category.toLowerCase();
      const title = l.generated_listing.title.toLowerCase();
      const desc = l.generated_listing.description.toLowerCase();
      return name.includes(q) || cat.includes(q) || title.includes(q) || desc.includes(q);
    });
  }

  if (selectedChannel !== 'all') {
    displayedListings = displayedListings.filter(
      (l) => l.product_input.marketplace.toLowerCase() === selectedChannel.toLowerCase()
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Saved Listings & History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, edit, or export previously generated product listings.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-fit">
          Total Saved: <span className="text-indigo-600 font-bold">{listings.length}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSemanticSearch} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords or semantic phrase (e.g. 'cozy handmade gift for coffee lover')..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Semantic Search Button */}
          <button
            type="submit"
            disabled={isSemanticSearching}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSemanticSearching ? 'Searching...' : 'Semantic Search'}</span>
          </button>

          {/* Channel Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none focus:border-indigo-600"
            >
              <option value="all">All Channels</option>
              <option value="General ecommerce">General Ecommerce</option>
              <option value="Etsy">Etsy</option>
              <option value="eBay">eBay</option>
              <option value="Instagram">Instagram</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
        </form>

        {/* Semantic Search Status Notice (Truthful fallback) */}
        {semanticResults && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              semanticResults.method === 'vector_search'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Database className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold">
                <span>
                  {semanticResults.method === 'vector_search'
                    ? 'MongoDB Atlas $vectorSearch Active'
                    : 'Atlas Vector Search Fallback (Keyword Matching)'}
                </span>
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.2 rounded bg-white/60 border border-current">
                  {semanticResults.method}
                </span>
              </div>
              <p className="mt-0.5 opacity-90">{semanticResults.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Listings List */}
      {displayedListings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <p className="text-base font-semibold text-slate-700">No matching listings found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search query or reset filters.'
              : 'Generate your first listing to view it here.'}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedListings.map((item) => {
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={item._id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Left */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      {item.product_input.product_name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.product_input.marketplace}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.product_input.category}
                    </span>
                    {item.is_sample && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                        Demo Sample
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {item.generated_listing.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.generated_listing.description}
                  </p>

                  {/* Keywords tags */}
                  {item.generated_listing.keywords && item.generated_listing.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.generated_listing.keywords.slice(0, 5).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                        >
                          #{kw}
                        </span>
                      ))}
                      {item.generated_listing.keywords.length > 5 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          +{item.generated_listing.keywords.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Right */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopyTitle(item._id, item.generated_listing.title)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
                    title="Copy SEO Title"
                  >
                    {copiedId === item._id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onExportListing(item.generated_listing, item.product_input)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
                    title="Export as Text or CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenListing(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/60 transition-colors"
                  >
                    <span>Open & Edit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete listing "${item.product_input.product_name}"?`)) {
                        onDeleteListing(item._id);
                      }
                    }}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
