import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Server,
  Code,
  ShieldCheck,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ReadinessResponse } from '../types';
import { api } from '../api';
import { Logo } from './Logo';

interface SettingsViewProps {
  readiness: ReadinessResponse | null;
  onRefreshReadiness: () => void;
}

const ATLAS_VECTOR_INDEX_JSON = `{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}`;

export const SettingsView: React.FC<SettingsViewProps> = ({ readiness, onRefreshReadiness }) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshReadiness();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCopyIndexJson = () => {
    navigator.clipboard.writeText(ATLAS_VECTOR_INDEX_JSON);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isAiOnline = readiness?.ai_provider_ready ?? false;
  const isAtlas = readiness?.database_type === 'mongodb_atlas';

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Logo variant="icon" size="sm" />
            <span>System Settings &amp; Architecture</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Diagnostics for local open-weight inference, MongoDB Atlas integration, and Render deployment modes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* AI Diagnostics Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">AI Inference Provider</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Mode: {readiness?.ai_provider || 'ollama'}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isAiOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isAiOnline ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{isAiOnline ? 'Online' : 'Degraded'}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Configured Model:</span>
              <span className="font-mono font-semibold text-slate-800">
                {readiness?.ai_model || 'gemma3:1b'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Inference Type:</span>
              <span className="font-medium text-slate-800">
                {readiness?.ai_provider === 'ollama' ? 'Local Ollama Runtime' : 'Hosted OpenAI-Compatible'}
              </span>
            </div>
            <div className="py-1">
              <span className="text-slate-500 block mb-1">Status Message:</span>
              <p className="p-2.5 rounded-xl bg-slate-50 text-slate-700 font-mono text-[11px] border border-slate-200/60 leading-relaxed">
                {readiness?.details?.ai_message || 'Initializing provider...'}
              </p>
            </div>
          </div>
        </div>

        {/* Database Diagnostics Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Database & Persistence</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {readiness?.database_type || 'local'}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isAtlas
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAtlas ? 'Atlas Connected' : 'In-Memory Store'}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Active Storage:</span>
              <span className="font-semibold text-slate-800">
                {isAtlas ? 'MongoDB Atlas Cluster' : 'Resilient In-Memory Fallback'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Atlas Vector Search:</span>
              <span className="font-semibold text-indigo-700">
                {isAtlas ? 'Supported via $vectorSearch' : 'Graceful Text Fallback'}
              </span>
            </div>
            <div className="py-1">
              <span className="text-slate-500 block mb-1">Status Message:</span>
              <p className="p-2.5 rounded-xl bg-slate-50 text-slate-700 font-mono text-[11px] border border-slate-200/60 leading-relaxed">
                {readiness?.details?.database_message || 'Database ready.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Modes Reference */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-600" />
          <span>Supported Deployment Modes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-1.5">
            <span className="font-bold text-indigo-900 block">Mode A: Local Windows Dev</span>
            <p className="text-indigo-800/80 leading-relaxed">
              FastAPI + React on laptop, using local Ollama (<span className="font-mono">gemma3:1b</span>) on port 11434. 100% free, private, and offline-capable.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900 block">Mode B: Render Demo + Hosted AI</span>
            <p className="text-slate-600 leading-relaxed">
              Unified React + FastAPI service on Render. Uses <span className="font-mono">OPENAI_COMPATIBLE_BASE_URL</span> pointing to any remote endpoint hosting open-weight models.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900 block">Mode C: Render Standalone Demo</span>
            <p className="text-slate-600 leading-relaxed">
              Render deployment starts cleanly without crashing when Ollama is unreachable. Provides clear feedback and demo sample records.
            </p>
          </div>
        </div>
      </div>

      {/* MongoDB Atlas Vector Search Setup Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>MongoDB Atlas Vector Search Index Configuration</span>
          </h2>
          <button
            type="button"
            onClick={handleCopyIndexJson}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Index JSON'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          To enable true semantic similarity queries using Atlas <span className="font-mono font-semibold">$vectorSearch</span>:
        </p>

        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
          <li>Log into your <strong>MongoDB Atlas</strong> dashboard and select your cluster.</li>
          <li>Navigate to <strong>Atlas Search</strong> &rarr; <strong>Create Search Index</strong>.</li>
          <li>Choose <strong>Atlas Vector Search (JSON Editor)</strong>.</li>
          <li>Select database <strong>open_list_db</strong> and collection <strong>listings</strong>.</li>
          <li>Set the Index Name to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-700">vector_index</code>.</li>
          <li>Paste the following JSON index definition:</li>
        </ol>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            {ATLAS_VECTOR_INDEX_JSON}
          </pre>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          *Note: If the index is not created, Open List automatically falls back truthfully to MongoDB keyword and text filtering without failing.
        </p>
      </div>
    </div>
  );
};
