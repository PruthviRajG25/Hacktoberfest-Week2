import React, { useState } from 'react';
import { Download, Copy, Check, X, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { GeneratedListing, ProductInput } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: GeneratedListing;
  input: ProductInput;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  listing,
  input,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileNameBase = input.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'product-listing';

  const generateTextFormat = () => {
    return `OPEN LIST — AI PRODUCT LISTING EXPORT
Generated: ${new Date().toISOString()}
Target Channel: ${input.marketplace}
Brand Tone: ${input.brand_voice}
=====================================================

TITLE:
${listing.title}

DESCRIPTION:
${listing.description}

KEY PRODUCT HIGHLIGHTS:
${listing.highlights.map((h) => `• ${h}`).join('\n')}

SEARCH KEYWORDS & TAGS:
${listing.keywords.join(', ')}

SOCIAL MEDIA CAPTION:
${listing.social_caption}

CALL TO ACTION:
${listing.call_to_action}

ALTERNATIVE TITLE SUGGESTIONS:
${listing.alternative_titles.map((t) => `• ${t}`).join('\n')}
`;
  };

  const handleDownloadTxt = () => {
    const text = generateTextFormat();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileNameBase}-listing.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const headers = ['Product Name', 'Category', 'Price', 'Currency', 'Channel', 'Title', 'Description', 'Highlights', 'Keywords', 'Social Caption', 'Call To Action'];
    const row = [
      escapeCsv(input.product_name),
      escapeCsv(input.category),
      input.price != null ? String(input.price) : '',
      escapeCsv(input.currency),
      escapeCsv(input.marketplace),
      escapeCsv(listing.title),
      escapeCsv(listing.description),
      escapeCsv(listing.highlights.join('; ')),
      escapeCsv(listing.keywords.join(', ')),
      escapeCsv(listing.social_caption),
      escapeCsv(listing.call_to_action),
    ];
    const csvContent = headers.join(',') + '\n' + row.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileNameBase}-listing.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = {
      product_input: input,
      generated_listing: listing,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileNameBase}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextFormat());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900">Export Product Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Download your ready-to-publish listing in your preferred format for Etsy, eBay, Shopify, or inventory spreadsheets.
        </p>

        {/* Download Options */}
        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-xs text-slate-900 block group-hover:text-indigo-700">
                  Formatted Text File (.txt)
                </span>
                <span className="text-[11px] text-slate-400">Clean sections for copy-pasting</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-xs text-slate-900 block group-hover:text-indigo-700">
                  Spreadsheet CSV (.csv)
                </span>
                <span className="text-[11px] text-slate-400">Excel / Google Sheets import</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-xs text-slate-900 block group-hover:text-indigo-700">
                  Structured JSON (.json)
                </span>
                <span className="text-[11px] text-slate-400">Direct API integration & backup</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw Text'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
