import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CreateListing } from './components/CreateListing';
import { SavedListings } from './components/SavedListings';
import { BrandProfileView } from './components/BrandProfileView';
import { SettingsView } from './components/SettingsView';
import { ExportModal } from './components/ExportModal';
import {
  ListingDocument,
  ProductInput,
  GeneratedListing,
  ReadinessResponse,
  SamplePreset
} from './types';
import { api } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [listings, setListings] = useState<ListingDocument[]>([]);
  const [samplePresets, setSamplePresets] = useState<SamplePreset[]>([]);

  // Navigation / prefill state
  const [editingListing, setEditingListing] = useState<ListingDocument | null>(null);
  const [prefillInput, setPrefillInput] = useState<ProductInput | null>(null);

  // Export Modal state
  const [exportData, setExportData] = useState<{
    listing: GeneratedListing;
    input: ProductInput;
  } | null>(null);

  useEffect(() => {
    fetchReadiness();
    fetchListings();
    fetchPresets();
  }, []);

  const fetchReadiness = async () => {
    try {
      const data = await api.getHealthReady();
      setReadiness(data);
    } catch (err) {
      console.error('Error fetching readiness:', err);
    }
  };

  const fetchListings = async () => {
    try {
      const data = await api.getListings(1, 100);
      setListings(data.items);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await api.getSamplePresets();
      if (res?.samples) {
        setSamplePresets(res.samples);
      }
    } catch (err) {
      console.error('Error fetching sample presets:', err);
    }
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setEditingListing(null);
    setPrefillInput({
      product_name: preset.product_name,
      category: preset.category,
      features_and_specs: preset.features_and_specs,
      price: preset.price,
      currency: preset.currency,
      target_audience: preset.target_audience,
      brand_name: preset.brand_name,
      brand_voice: preset.brand_voice,
      marketplace: preset.marketplace,
      output_language: preset.output_language || 'English',
    });
    setCurrentTab('create');
  };

  const handleOpenListing = (listing: ListingDocument) => {
    setPrefillInput(null);
    setEditingListing(listing);
    setCurrentTab('create');
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((item) => item._id !== id));
      if (editingListing?._id === id) {
        setEditingListing(null);
      }
    } catch (err: any) {
      alert(`Could not delete listing: ${err.message}`);
    }
  };

  const handleExportRequest = (listing: GeneratedListing, input: ProductInput) => {
    setExportData({ listing, input });
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-slate-900 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'create' && currentTab !== 'create') {
            // Keep existing editing or prefill if navigating explicitly
          }
          setCurrentTab(tab);
        }}
        readiness={readiness}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            listings={listings}
            readiness={readiness}
            samplePresets={samplePresets}
            onSelectPreset={handleSelectPreset}
            onNavigateTab={setCurrentTab}
            onViewListing={handleOpenListing}
          />
        )}

        {currentTab === 'create' && (
          <CreateListing
            initialInput={prefillInput}
            initialListing={editingListing}
            samplePresets={samplePresets}
            readiness={readiness}
            onListingSaved={fetchListings}
            onExportRequest={handleExportRequest}
          />
        )}

        {currentTab === 'saved' && (
          <SavedListings
            listings={listings}
            onOpenListing={handleOpenListing}
            onDeleteListing={handleDeleteListing}
            onExportListing={handleExportRequest}
          />
        )}

        {currentTab === 'brand' && <BrandProfileView />}

        {currentTab === 'settings' && (
          <SettingsView
            readiness={readiness}
            onRefreshReadiness={fetchReadiness}
          />
        )}
      </main>

      {/* Export Modal */}
      {exportData && (
        <ExportModal
          isOpen={true}
          onClose={() => setExportData(null)}
          listing={exportData.listing}
          input={exportData.input}
        />
      )}

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Open List</span>
            <span>—</span>
            <span>AI Product Listing Generator for Independent Sellers</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Model: <strong className="font-mono text-indigo-700">{readiness?.ai_model || 'gemma3:1b'}</strong></span>
            <span>•</span>
            <span>Persistence: <strong>{readiness?.database_type === 'mongodb_atlas' ? 'MongoDB Atlas' : 'In-Memory Store'}</strong></span>
            <span>•</span>
            <a href="/docs" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
              Swagger API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
