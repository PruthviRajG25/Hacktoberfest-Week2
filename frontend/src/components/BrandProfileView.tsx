import React, { useState, useEffect } from 'react';
import {
  Palette,
  Save,
  Check,
  ShieldAlert,
  Sparkles,
  Info,
  Tag,
  Plus,
  RefreshCw
} from 'lucide-react';
import { BrandProfile } from '../types';
import { api } from '../api';

export const BrandProfileView: React.FC = () => {
  const [profile, setProfile] = useState<BrandProfile>({
    brand_name: '',
    description: '',
    preferred_tone: 'Friendly',
    target_audience: '',
    preferred_terminology: [],
    words_to_avoid: [],
    default_language: 'English',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [termInput, setTermInput] = useState<string>('');
  const [avoidInput, setAvoidInput] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getBrandProfile();
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to load brand profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await api.updateBrandProfile(profile);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save brand profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addTerm = () => {
    if (termInput.trim() && !profile.preferred_terminology.includes(termInput.trim())) {
      setProfile({
        ...profile,
        preferred_terminology: [...profile.preferred_terminology, termInput.trim()],
      });
      setTermInput('');
    }
  };

  const removeTerm = (term: string) => {
    setProfile({
      ...profile,
      preferred_terminology: profile.preferred_terminology.filter((t) => t !== term),
    });
  };

  const addAvoid = () => {
    if (avoidInput.trim() && !profile.words_to_avoid.includes(avoidInput.trim())) {
      setProfile({
        ...profile,
        words_to_avoid: [...profile.words_to_avoid, avoidInput.trim()],
      });
      setAvoidInput('');
    }
  };

  const removeAvoid = (word: string) => {
    setProfile({
      ...profile,
      words_to_avoid: profile.words_to_avoid.filter((w) => w !== word),
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        <p className="text-sm">Loading brand guidelines...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <span>Seller Brand Profile</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your brand identity and vocabulary. These settings guide open-weight AI generation for consistent brand voice.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>Profile Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Core Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Brand / Shop Name
              </label>
              <input
                type="text"
                value={profile.brand_name}
                onChange={(e) => setProfile({ ...profile, brand_name: e.target.value })}
                placeholder="e.g. Earth & Kiln Studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Brand Voice / Tone
              </label>
              <select
                value={profile.preferred_tone}
                onChange={(e) => setProfile({ ...profile, preferred_tone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none bg-white text-slate-900"
              >
                <option value="Friendly">Friendly & Approachable</option>
                <option value="Premium">Premium & Luxurious</option>
                <option value="Minimalist">Minimalist & Direct</option>
                <option value="Playful">Playful & Witty</option>
                <option value="Professional">Professional & Authoritative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brand Mission / Philosophy
            </label>
            <textarea
              rows={3}
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="e.g. We design heirloom pottery for slow coffee rituals using small-batch natural clay."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Target Audience
              </label>
              <input
                type="text"
                value={profile.target_audience || ''}
                onChange={(e) => setProfile({ ...profile, target_audience: e.target.value })}
                placeholder="e.g. Coffee lovers, minimalist interior decorators"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Language
              </label>
              <input
                type="text"
                value={profile.default_language}
                onChange={(e) => setProfile({ ...profile, default_language: e.target.value })}
                placeholder="English"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Vocabulary Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Terminology & Brand Guardrails
          </h2>

          {/* Preferred Terminology */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Preferred Terminology to Emphasize
              </label>
              <span className="text-[11px] text-slate-400">Words the AI should weave in</span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-8">
              {profile.preferred_terminology.map((term, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200/60"
                >
                  <Tag className="w-3 h-3" />
                  <span>{term}</span>
                  <button
                    type="button"
                    onClick={() => removeTerm(term)}
                    className="hover:text-rose-500 ml-1 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTerm();
                  }
                }}
                placeholder="e.g. wheel-thrown, sustainable clay, mindful living"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600 text-slate-900"
              />
              <button
                type="button"
                onClick={addTerm}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Add Term
              </button>
            </div>
          </div>

          {/* Words or phrases to avoid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Forbidden Words & Phrases (Strict Blacklist)</span>
              </label>
              <span className="text-[11px] text-slate-400">Never allow in generated copy</span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-8">
              {profile.words_to_avoid.map((word, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200/60"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => removeAvoid(word)}
                    className="hover:text-rose-900 ml-1 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAvoid();
                  }
                }}
                placeholder="e.g. cheap, miracle, 100% cure, best in the world"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-400 text-slate-900"
              />
              <button
                type="button"
                onClick={addAvoid}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200/50"
              >
                Add Forbidden Word
              </button>
            </div>
          </div>
        </div>

        {/* Security & Prompt Injection notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Security Architecture:</strong> Brand profile preferences are securely passed into the open-weight model's system prompt instructions while keeping user-provided product details segregated inside explicit factual data tags. This prevents prompt injection from overriding strict safety and factuality guidelines.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Brand Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
