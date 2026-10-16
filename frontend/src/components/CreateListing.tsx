import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Download,
  Save,
  AlertTriangle,
  HelpCircle,
  Tag,
  Share2,
  ListPlus,
  Compass,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  ProductInput,
  GeneratedListing,
  ListingDocument,
  SamplePreset,
  ReadinessResponse
} from '../types';
import { api } from '../api';

interface CreateListingProps {
  initialInput?: ProductInput | null;
  initialListing?: ListingDocument | null;
  samplePresets: SamplePreset[];
  readiness: ReadinessResponse | null;
  onListingSaved: () => void;
  onExportRequest: (listing: GeneratedListing, input: ProductInput) => void;
}

const DEFAULT_INPUT: ProductInput = {
  product_name: '',
  category: '',
  features_and_specs: '',
  price: undefined,
  currency: 'USD',
  target_audience: '',
  brand_name: '',
  brand_voice: 'Friendly',
  marketplace: 'General ecommerce',
  output_language: 'English',
};

export const CreateListing: React.FC<CreateListingProps> = ({
  initialInput,
  initialListing,
  samplePresets,
  readiness,
  onListingSaved,
  onExportRequest,
}) => {
  const [formData, setFormData] = useState<ProductInput>(DEFAULT_INPUT);
  const [applyBrandProfile, setApplyBrandProfile] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Preparing product specifications...');
  const [error, setError] = useState<{ message: string; resolution?: string } | null>(null);

  // Result state
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedListing | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Regenerate section state
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>('');

  useEffect(() => {
    if (initialInput) {
      setFormData(initialInput);
    }
    if (initialListing) {
      setActiveListingId(initialListing._id);
      setFormData(initialListing.product_input);
      setGeneratedResult(initialListing.generated_listing);
      setModelUsed(initialListing.ai_model_used || 'open-weight-ai');
    }
  }, [initialInput, initialListing]);

  const handleInputChange = (field: keyof ProductInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopy = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleCopyEntireListing = () => {
    if (!generatedResult) return;
    const fullText = `=== ${generatedResult.title} ===

--- PRODUCT DESCRIPTION ---
${generatedResult.description}

--- KEY HIGHLIGHTS ---
${generatedResult.highlights.map((h) => `• ${h}`).join('\n')}

--- SEO KEYWORDS & TAGS ---
${generatedResult.keywords.join(', ')}

--- SOCIAL MEDIA CAPTION ---
${generatedResult.social_caption}

--- CALL TO ACTION ---
${generatedResult.call_to_action}

--- ALTERNATIVE TITLES ---
${generatedResult.alternative_titles.map((t) => `• ${t}`).join('\n')}
`;
    handleCopy(fullText, 'entire');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name.trim() || !formData.category.trim() || !formData.features_and_specs.trim()) {
      setError({ message: 'Please provide Product Name, Category, and Features & Specifications.' });
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    // Dynamic loading feedback animation
    const steps = [
      'Sending structured prompt to gemma3:1b...',
      'Applying strict factuality & tone rules...',
      'Generating SEO title, description, and keywords...',
      'Validating JSON response structure...'
    ];
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 1800);

    try {
      const response = await api.generateListing(formData, applyBrandProfile);
      setGeneratedResult(response.generated_listing);
      setActiveListingId(response.listing_id);
      setModelUsed(response.model_used);
      onListingSaved();
    } catch (err: any) {
      setError({
        message: err.message || 'Generation failed.',
        resolution: err.resolution || 'Verify that Ollama is running locally with gemma3:1b or check Settings.'
      });
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleRegenerate = async (section: string) => {
    if (!generatedResult) return;
    setRegeneratingSection(section);
    try {
      const current = (generatedResult as any)[section];
      const res = await api.regenerateSection(
        section,
        formData,
        typeof current === 'string' ? current : JSON.stringify(current)
      );

      setGeneratedResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [section]: res.content,
        };
      });
    } catch (err: any) {
      alert(`Could not regenerate ${section}: ${err.message}`);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeListingId || !generatedResult) return;
    setIsSaving(true);
    try {
      await api.updateListing(activeListingId, generatedResult, formData);
      setSaveSuccess(true);
      onListingSaved();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Error saving listing: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const loadSamplePreset = (preset: SamplePreset) => {
    setFormData({
      product_name: preset.product_name,
      category: preset.category,
      features_and_specs: preset.features_and_specs,
      price: preset.price,
      currency: preset.currency,
      target_audience: preset.target_audience || '',
      brand_name: preset.brand_name || '',
      brand_voice: preset.brand_voice,
      marketplace: preset.marketplace,
      output_language: preset.output_language || 'English',
    });
    setError(null);
  };

  // Fallback demo mock if Ollama is not installed
  const loadFallbackDemoOutput = () => {
    const matched = samplePresets.find((p) => p.product_name === formData.product_name) || samplePresets[0];
    setFormData(matched);
    setGeneratedResult({
      title: `${matched.product_name} - Handcrafted Artisanal Quality`,
      description: `Carefully crafted and built with exceptional attention to detail. Features ${matched.features_and_specs}. Perfect for ${matched.target_audience || 'discerning customers'}.`,
      highlights: [
        'Crafted from verified sustainable, high-grade materials',
        'Designed specifically for durability and aesthetic beauty',
        'Hand-finished with artisan attention to every detail',
        'Direct from the maker to your doorstep'
      ],
      keywords: ['handmade', 'artisan', 'sustainable', 'gift idea', matched.category.toLowerCase()],
      social_caption: `Elevate your lifestyle ✨ Discover our ${matched.product_name}. Tap the link in our bio to shop handcrafted quality! #Handmade #SmallBusiness #Artisan`,
      call_to_action: 'Order today to enjoy exceptional small-batch craftsmanship.',
      alternative_titles: [
        `Authentic ${matched.product_name} - Small Batch Edition`,
        `Premium ${matched.product_name} for Everyday Living`
      ]
    });
    setActiveListingId('sample-fallback-' + Date.now());
    setModelUsed('demo-sample-mode');
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-6">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Create AI Product Listing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Powered by open-weight AI (<span className="font-mono text-indigo-700">{readiness?.ai_model || 'gemma3:1b'}</span>) with strict factuality enforcement.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Sample Presets:</span>
          {samplePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadSamplePreset(preset)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-medium shrink-0 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900">Product Specifications</h2>
            <button
              type="button"
              onClick={() => setFormData(DEFAULT_INPUT)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Reset Form
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-sm">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="e.g. 14 oz Stoneware Ceramic Coffee Mug"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Category & Marketplace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g. Handmade Pottery"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sales Channel
                </label>
                <select
                  value={formData.marketplace}
                  onChange={(e) => handleInputChange('marketplace', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white text-slate-900"
                >
                  <option value="General ecommerce">General Ecommerce</option>
                  <option value="Etsy">Etsy (Story & Tags)</option>
                  <option value="eBay">eBay (SEO Keywords)</option>
                  <option value="Instagram">Instagram (Social Hooks)</option>
                  <option value="WhatsApp">WhatsApp (Direct Chat)</option>
                </select>
              </div>
            </div>

            {/* Features & Specs */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Features, Materials & Specs <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Strictly fact-grounded</span>
              </div>
              <textarea
                required
                rows={4}
                value={formData.features_and_specs}
                onChange={(e) => handleInputChange('features_and_specs', e.target.value)}
                placeholder="Include materials, dimensions, capacity, handcrafted details, care instructions, origin..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price ?? ''}
                  onChange={(e) =>
                    handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="38.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  placeholder="USD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Brand Name & Voice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand / Shop Name
                </label>
                <input
                  type="text"
                  value={formData.brand_name || ''}
                  onChange={(e) => handleInputChange('brand_name', e.target.value)}
                  placeholder="e.g. Earth & Kiln"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Voice</label>
                <select
                  value={formData.brand_voice}
                  onChange={(e) => handleInputChange('brand_voice', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white text-slate-900"
                >
                  <option value="Friendly">Friendly & Warm</option>
                  <option value="Premium">Premium & Elegant</option>
                  <option value="Minimalist">Minimalist & Direct</option>
                  <option value="Playful">Playful & Energetic</option>
                  <option value="Professional">Professional & Technical</option>
                </select>
              </div>
            </div>

            {/* Target Audience & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.target_audience || ''}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="e.g. Coffee lovers, home chefs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
                <input
                  type="text"
                  value={formData.output_language}
                  onChange={(e) => handleInputChange('output_language', e.target.value)}
                  placeholder="English"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Apply Brand Profile Switch */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyBrandProfile}
                  onChange={(e) => setApplyBrandProfile(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Apply saved Brand Profile rules & terminology
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Listing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Listing</span>
                </>
              )}
            </button>
          </form>

          {/* Factuality Notice Card */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Factual Guardrails Active</p>
              <p className="text-indigo-800/80 mt-0.5 leading-relaxed">
                Open List will never invent unsupported claims, certifications, or fake reviews. Only features provided in your specs are transformed into persuasive copy.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Results & Editing */}
        <div className="lg:col-span-7 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Generation Error</p>
                  <p className="text-xs text-amber-800 mt-1">{error.message}</p>
                  {error.resolution && (
                    <p className="text-xs text-amber-700 mt-2 bg-amber-100/60 p-2 rounded-lg border border-amber-200/50">
                      <strong>Troubleshooting:</strong> {error.resolution}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors"
                >
                  Retry Request
                </button>
                <button
                  type="button"
                  onClick={loadFallbackDemoOutput}
                  className="px-3 py-1.5 rounded-lg border border-amber-400 bg-white text-amber-800 text-xs font-semibold hover:bg-amber-50 transition-colors"
                >
                  Load Sample Preview (Demo Mode)
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation Box */}
          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">Crafting Ecommerce Listing</h3>
                <p className="text-xs text-indigo-600 font-mono animate-bounce">{loadingStep}</p>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Running locally with open-weight <span className="font-mono text-slate-600">gemma3:1b</span> on your laptop. Zero cloud API fees.
              </p>
            </div>
          )}

          {/* Initial Blank State */}
          {!loading && !generatedResult && !error && (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-800">Ready to Generate</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Fill in your product specifications on the left or select a sample preset above, then click <strong>Generate Listing</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Output Display Cards */}
          {generatedResult && (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Model: {modelUsed || 'gemma3:1b'}
                  </span>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEntireListing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
                  >
                    {copiedSection === 'entire' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Edits'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onExportRequest(generatedResult, formData)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* 1. SEO Product Title */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    SEO Product Title
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegenerate('title')}
                      disabled={regeneratingSection === 'title'}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${regeneratingSection === 'title' ? 'animate-spin' : ''}`}
                      />
                      <span>Regenerate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedResult.title, 'title')}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      {copiedSection === 'title' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSection === 'title' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={generatedResult.title}
                  onChange={(e) =>
                    setGeneratedResult({ ...generatedResult, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-base text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />

                {/* Alternative Titles */}
                {generatedResult.alternative_titles && generatedResult.alternative_titles.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-medium text-slate-400">
                      Alternative Variations (click to use):
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {generatedResult.alternative_titles.map((alt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGeneratedResult({ ...generatedResult, title: alt })}
                          className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/60 text-slate-700 hover:text-indigo-800 transition-colors flex items-center justify-between group"
                        >
                          <span>{alt}</span>
                          <span className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 font-semibold">
                            Use this &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Product Description */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Product Description
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegenerate('description')}
                      disabled={regeneratingSection === 'description'}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${regeneratingSection === 'description' ? 'animate-spin' : ''}`}
                      />
                      <span>Regenerate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedResult.description, 'description')}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      {copiedSection === 'description' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSection === 'description' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={generatedResult.description}
                  onChange={(e) =>
                    setGeneratedResult({ ...generatedResult, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              {/* 3. Key Product Highlights */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Key Highlights & Features
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegenerate('highlights')}
                      disabled={regeneratingSection === 'highlights'}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${regeneratingSection === 'highlights' ? 'animate-spin' : ''}`}
                      />
                      <span>Regenerate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(generatedResult.highlights.map((h) => `• ${h}`).join('\n'), 'highlights')
                      }
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      {copiedSection === 'highlights' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSection === 'highlights' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {generatedResult.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => {
                          const updated = [...generatedResult.highlights];
                          updated[index] = e.target.value;
                          setGeneratedResult({ ...generatedResult, highlights: updated });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-indigo-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = generatedResult.highlights.filter((_, i) => i !== index);
                          setGeneratedResult({ ...generatedResult, highlights: updated });
                        }}
                        className="text-slate-300 hover:text-rose-500 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedResult({
                        ...generatedResult,
                        highlights: [...generatedResult.highlights, 'New feature bullet'],
                      });
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 pt-1"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>
              </div>

              {/* 4. Search Keywords & Tags */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Search Keywords & Tags ({generatedResult.keywords.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedResult.keywords.join(', '), 'keywords')}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {copiedSection === 'keywords' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedSection === 'keywords' ? 'Copied' : 'Copy All Tags'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {generatedResult.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = generatedResult.keywords.filter((_, idx) => idx !== i);
                          setGeneratedResult({ ...generatedResult, keywords: filtered });
                        }}
                        className="text-slate-400 hover:text-rose-500 ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new tag field */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        setGeneratedResult({
                          ...generatedResult,
                          keywords: [...generatedResult.keywords, newTagInput.trim()],
                        });
                        setNewTagInput('');
                      }
                    }}
                    placeholder="Type a new tag and press Enter"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTagInput.trim()) {
                        setGeneratedResult({
                          ...generatedResult,
                          keywords: [...generatedResult.keywords, newTagInput.trim()],
                        });
                        setNewTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 5. Short Social Media Caption */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Social Media Caption
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegenerate('social_caption')}
                      disabled={regeneratingSection === 'social_caption'}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${regeneratingSection === 'social_caption' ? 'animate-spin' : ''}`}
                      />
                      <span>Regenerate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedResult.social_caption, 'social')}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      {copiedSection === 'social' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSection === 'social' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={generatedResult.social_caption}
                  onChange={(e) =>
                    setGeneratedResult({ ...generatedResult, social_caption: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              {/* 6. Call to Action */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Call To Action
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedResult.call_to_action, 'cta')}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {copiedSection === 'cta' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedSection === 'cta' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={generatedResult.call_to_action}
                  onChange={(e) =>
                    setGeneratedResult({ ...generatedResult, call_to_action: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
