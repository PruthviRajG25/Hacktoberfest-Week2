import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Palette,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCode,
  Layout,
  Eye,
  Sliders,
  Share2
} from 'lucide-react';
import { Logo, LogoMark, LogoVariant, LogoSize, LogoTheme } from './Logo';

export const LogoPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'light' | 'slate' | 'cosmic' | 'grid'>('light');
  const [previewSize, setPreviewSize] = useState<LogoSize>('lg');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Raw SVG codes for direct copying
  const rawLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 56" fill="none">
  <defs>
    <linearGradient id="ol-full-bg" x1="4" y1="4" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
    <linearGradient id="ol-full-sheet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <linearGradient id="ol-text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
  </defs>
  <g transform="translate(4, 4)">
    <rect width="48" height="48" rx="13" fill="url(#ol-full-bg)" />
    <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="12.25" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5" />
    <path d="M15 17C15 14.7909 16.7909 13 19 13H28.5858C29.6466 13 30.664 13.4214 31.4142 14.1716L35.8284 18.5858C36.5786 19.336 37 20.3534 37 21.4142V33C37 35.2091 35.2091 37 33 37H19C16.7909 37 15 35.2091 15 33V17Z" fill="url(#ol-full-sheet)" />
    <circle cx="22" cy="19" r="2.2" fill="#7c3aed" />
    <circle cx="22" cy="19" r="1.1" fill="#ffffff" />
    <rect x="19" y="24" width="14" height="2.2" rx="1.1" fill="#6366f1" />
    <rect x="19" y="28.5" width="11" height="2.2" rx="1.1" fill="#818cf8" />
    <rect x="19" y="33" width="7" height="2" rx="1" fill="#a5b4fc" />
    <path d="M38 9C38 12.866 34.866 16 31 16C34.866 16 38 19.134 38 23C38 19.134 41.134 16 45 16C41.134 16 38 12.866 38 9Z" fill="#38bdf8" />
  </g>
  <text x="64" y="32" font-family="'Inter', sans-serif" font-size="22" font-weight="800" fill="#0f172a" letter-spacing="-0.5">Open</text>
  <text x="124" y="32" font-family="'Inter', sans-serif" font-size="22" font-weight="800" fill="url(#ol-text-grad)" letter-spacing="-0.5">List</text>
  <text x="65" y="47" font-family="'Inter', sans-serif" font-size="9.5" font-weight="600" fill="#64748b" letter-spacing="0.3">AI ECOMMERCE LISTING GENERATOR</text>
</svg>`;

  const rawIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <defs>
    <linearGradient id="ol-bg-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
    <linearGradient id="ol-spark-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <linearGradient id="ol-sheet-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ol-bg-grad)" />
  <rect x="2.75" y="2.75" width="42.5" height="42.5" rx="11.25" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5" />
  <path d="M14 16C14 13.7909 15.7909 12 18 12H27.5858C28.6466 12 29.664 12.4214 30.4142 13.1716L34.8284 17.5858C35.5786 18.336 36 19.3534 36 20.4142V32C36 34.2091 34.2091 36 32 36H18C15.7909 36 14 34.2091 14 32V16Z" fill="url(#ol-sheet-grad)" />
  <circle cx="21" cy="18" r="2.2" fill="#7c3aed" />
  <circle cx="21" cy="18" r="1.1" fill="#ffffff" />
  <rect x="18" y="23" width="13" height="2.2" rx="1.1" fill="#6366f1" />
  <rect x="18" y="27.5" width="10" height="2.2" rx="1.1" fill="#818cf8" />
  <rect x="18" y="32" width="6" height="2" rx="1" fill="#a5b4fc" />
  <path d="M35 8C35 11.866 31.866 15 28 15C31.866 15 35 18.134 35 22C35 18.134 38.134 15 42 15C38.134 15 35 11.866 35 8Z" fill="url(#ol-spark-grad)" />
  <circle cx="35" cy="15" r="1" fill="#ffffff" />
</svg>`;

  const colorSwatches = [
    { name: 'Indigo 600 (Primary)', hex: '#4f46e5', rgb: 'rgb(79, 70, 229)', class: 'bg-indigo-600', text: 'text-white' },
    { name: 'Violet 600 (Accent)', hex: '#7c3aed', rgb: 'rgb(124, 58, 237)', class: 'bg-violet-600', text: 'text-white' },
    { name: 'Fuchsia 600 (Flare)', hex: '#c026d3', rgb: 'rgb(192, 38, 211)', class: 'bg-fuchsia-600', text: 'text-white' },
    { name: 'Sky 400 (AI Spark)', hex: '#38bdf8', rgb: 'rgb(56, 189, 248)', class: 'bg-sky-400', text: 'text-slate-900' },
    { name: 'Cosmic Slate 950', hex: '#020617', rgb: 'rgb(2, 6, 23)', class: 'bg-slate-950', text: 'text-white' },
    { name: 'Canvas White', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', class: 'bg-white border border-slate-200', text: 'text-slate-900' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-10">
      {/* Top Hero Brand Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/60">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Official Brand Identity &amp; Media Kit</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Open List <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Logo &amp; Banner</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Consistent, pixel-perfect visual branding across the entire site. Download high-resolution vector SVGs, inspect responsive variants, preview official web banners, and copy clean component snippets.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleDownload('/logo.svg', 'open-list-logo.svg')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Download className="w-4 h-4 text-indigo-700" />
                <span>Download Logo SVG</span>
              </button>
              <button
                onClick={() => handleDownload('/banner.svg', 'open-list-banner.svg')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Banner (1200×630)</span>
              </button>
              <button
                onClick={() => handleCopy('raw-logo', rawLogoSvg)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-semibold text-xs sm:text-sm transition-all"
              >
                {copiedKey === 'raw-logo' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{copiedKey === 'raw-logo' ? 'Copied SVG Markup!' : 'Copy Logo SVG Code'}</span>
              </button>
            </div>
          </div>

          {/* Large Live Emblem Showcase */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl shrink-0 self-center lg:self-auto">
            <Logo variant="stacked" size="2xl" theme="light" />
            <span className="text-[11px] font-mono text-indigo-300 mt-4 tracking-wider uppercase">
              Vector SVG • Scalable
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Official Site Banner Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-600" />
              <span>Official Site Banners</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-resolution promotional, open-graph social, and repository banners incorporating the unified logo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('/banner.svg', 'open-list-banner-1200x630.svg')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download SVG Banner</span>
            </button>
            <button
              onClick={() => handleCopy('og-tag', `<meta property="og:image" content="/banner.svg" />\n<meta name="twitter:image" content="/banner.svg" />`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              {copiedKey === 'og-tag' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === 'og-tag' ? 'Copied Meta Tag!' : 'Copy OpenGraph Tag'}</span>
            </button>
          </div>
        </div>

        {/* Banner Preview Card */}
        <div className="rounded-2xl border border-slate-200/90 overflow-hidden shadow-md bg-slate-950">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="font-mono text-slate-300 ml-2">banner.svg • 1200 × 630 px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Social Card • OpenGraph • GitHub Header</span>
              <a
                href="/banner.svg"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <span>View Fullscreen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="relative aspect-[1200/630] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src="/banner.svg"
              alt="Open List Official Banner"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Markdown Embed Snippet */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-semibold text-slate-900 block">Embed in GitHub README.md or Website Docs:</span>
            <code className="text-slate-600 font-mono text-[11px] mt-0.5 block truncate max-w-xl">
              [![Open List Banner](/banner.svg)](https://github.com/your-org/open-list)
            </code>
          </div>
          <button
            onClick={() => handleCopy('md-banner', `[![Open List Banner](/banner.svg)](https://github.com/your-org/open-list)`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors shrink-0"
          >
            {copiedKey === 'md-banner' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedKey === 'md-banner' ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Interactive Logo Variants & Showcase */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Unified Logo Variants</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identical vector mark used everywhere across the website, navigation, export sheets, and settings.
            </p>
          </div>

          {/* Interactive Canvas Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Canvas:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setPreviewBg('light')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${previewBg === 'light' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                White
              </button>
              <button
                onClick={() => setPreviewBg('slate')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${previewBg === 'slate' ? 'bg-slate-900 shadow-sm text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Slate
              </button>
              <button
                onClick={() => setPreviewBg('cosmic')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${previewBg === 'cosmic' ? 'bg-indigo-950 shadow-sm text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Cosmic
              </button>
              <button
                onClick={() => setPreviewBg('grid')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${previewBg === 'grid' ? 'bg-white shadow-sm text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Checker
              </button>
            </div>
          </div>
        </div>

        {/* Grid of Logo Variants */}
        {(() => {
          const bgClasses = {
            light: 'bg-white border-slate-200/80',
            slate: 'bg-slate-900 border-slate-800 text-white',
            cosmic: 'bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-900 text-white',
            grid: 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 border-slate-200',
          }[previewBg];

          const theme: LogoTheme = previewBg === 'slate' || previewBg === 'cosmic' ? 'light' : 'dark';

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Horizontal Lockup (Primary) */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-6 transition-all ${bgClasses}`}>
                <div>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-6 font-mono">
                    <span>PRIMARY HORIZONTAL</span>
                    <span>Navbar &amp; Headers</span>
                  </div>
                  <div className="min-h-[100px] flex items-center justify-center">
                    <Logo variant="horizontal" size="lg" theme={theme} showBadge={true} />
                  </div>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] opacity-70">Used in main navigation</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy('code-horiz', `<Logo variant="horizontal" size="md" />`)}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-700 dark:text-white font-medium transition-colors"
                      title="Copy React JSX"
                    >
                      {copiedKey === 'code-horiz' ? 'Copied!' : 'Copy JSX'}
                    </button>
                    <button
                      onClick={() => handleDownload('/logo.svg', 'open-list-logo-horizontal.svg')}
                      className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Download SVG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: App Icon / Emblem Only */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-6 transition-all ${bgClasses}`}>
                <div>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-6 font-mono">
                    <span>APP ICON / EMBLEM</span>
                    <span>Favicon &amp; Badges</span>
                  </div>
                  <div className="min-h-[100px] flex items-center justify-center">
                    <Logo variant="icon" size="xl" theme={theme} />
                  </div>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] opacity-70">Used in cards, favicon &amp; modal</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy('code-icon', `<Logo variant="icon" size="md" />`)}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-700 dark:text-white font-medium transition-colors"
                      title="Copy React JSX"
                    >
                      {copiedKey === 'code-icon' ? 'Copied!' : 'Copy JSX'}
                    </button>
                    <button
                      onClick={() => handleDownload('/logo-icon.svg', 'open-list-icon.svg')}
                      className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Download SVG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Stacked / Centered Lockup */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-6 transition-all ${bgClasses}`}>
                <div>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-6 font-mono">
                    <span>STACKED LOCKUP</span>
                    <span>Hero &amp; Splash</span>
                  </div>
                  <div className="min-h-[100px] flex items-center justify-center">
                    <Logo variant="stacked" size="lg" theme={theme} />
                  </div>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] opacity-70">Used in empty states &amp; splash</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy('code-stack', `<Logo variant="stacked" size="lg" />`)}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-700 dark:text-white font-medium transition-colors"
                      title="Copy React JSX"
                    >
                      {copiedKey === 'code-stack' ? 'Copied!' : 'Copy JSX'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4: Compact Badge Pill */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-6 transition-all ${bgClasses}`}>
                <div>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-6 font-mono">
                    <span>COMPACT BADGE PILL</span>
                    <span>Status &amp; Footers</span>
                  </div>
                  <div className="min-h-[100px] flex items-center justify-center">
                    <Logo variant="badge" theme={theme} badgeText="Open-Weight AI" />
                  </div>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] opacity-70">Compact inline brand badge</span>
                  <button
                    onClick={() => handleCopy('code-badge', `<Logo variant="badge" badgeText="Open-Weight AI" />`)}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-700 dark:text-white font-medium transition-colors"
                  >
                    {copiedKey === 'code-badge' ? 'Copied!' : 'Copy JSX'}
                  </button>
                </div>
              </div>

              {/* Card 5: Monochrome Adaptive */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-6 transition-all ${bgClasses}`}>
                <div>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-6 font-mono">
                    <span>MONOCHROME ADAPTIVE</span>
                    <span>Single-color Prints</span>
                  </div>
                  <div className="min-h-[100px] flex items-center justify-center">
                    <Logo variant="horizontal" size="md" theme="monochrome" showBadge={false} />
                  </div>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] opacity-70">Adapts to parent font color</span>
                  <button
                    onClick={() => handleCopy('code-mono', `<Logo variant="horizontal" theme="monochrome" />`)}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-700 dark:text-white font-medium transition-colors"
                  >
                    {copiedKey === 'code-mono' ? 'Copied!' : 'Copy JSX'}
                  </button>
                </div>
              </div>

              {/* Card 6: High-Res Standalone SVG Icon */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-6 transition-all ${bgClasses}`}>
                <div>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-6 font-mono">
                    <span>RAW SVG FILE</span>
                    <span>/public/logo-icon.svg</span>
                  </div>
                  <div className="min-h-[100px] flex items-center justify-center">
                    <img src="/logo-icon.svg" alt="Open List Vector Icon" className="w-16 h-16 shadow-lg rounded-xl" />
                  </div>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] opacity-70">Static standalone file</span>
                  <button
                    onClick={() => handleCopy('code-raw-icon', rawIconSvg)}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/20 text-indigo-700 dark:text-white font-medium transition-colors"
                  >
                    {copiedKey === 'code-raw-icon' ? 'Copied!' : 'Copy Raw SVG'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Section 3: Official Brand Colors */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <span>Brand Color System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered color harmony representing retail intelligence, reliability, and open-weight AI.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {colorSwatches.map((swatch) => (
            <div
              key={swatch.name}
              onClick={() => handleCopy(swatch.hex, swatch.hex)}
              className="cursor-pointer group rounded-xl p-3 border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className={`w-full h-14 rounded-lg shadow-inner mb-3 flex items-center justify-center transition-transform group-hover:scale-105 ${swatch.class}`}>
                {copiedKey === swatch.hex && (
                  <Check className={`w-5 h-5 ${swatch.text}`} />
                )}
              </div>
              <span className="font-bold text-xs text-slate-900 block truncate w-full">{swatch.name}</span>
              <span className="font-mono text-[11px] text-slate-500 block mt-0.5">{swatch.hex}</span>
              <span className="text-[10px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                Click to copy
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Brand Guidelines & Clear Space */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Do's & Guidelines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Brand Integrity Best Practices</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Use the unified SVG everywhere</strong>: Always import <code>&lt;Logo /&gt;</code> or reference <code>/logo.svg</code> to guarantee crisp rendering on high-DPI displays.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Maintain clear space</strong>: Keep a minimum margin of padding around the logo mark equal to the eyelet diameter.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Use the appropriate theme</strong>: Apply <code>theme="light"</code> on dark backgrounds (Slate 950 or Indigo 950) and <code>theme="dark"</code> on white/light canvases.</span>
            </li>
          </ul>
        </div>

        {/* Anti-Patterns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>What to Avoid</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Do not distort or stretch</strong>: Maintain a 1:1 aspect ratio on the icon emblem mark and standard proportions on wordmarks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Do not alter gradient colors</strong>: Use the canonical Indigo-to-Purple-to-Fuchsia color progression for consistency.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Do not place on low-contrast backgrounds</strong>: Avoid using dark text variants on dark surfaces or white emblems on yellow backgrounds.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoPage;
