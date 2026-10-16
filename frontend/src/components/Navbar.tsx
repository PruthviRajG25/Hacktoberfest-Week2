import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  BookmarkCheck,
  Palette,
  Settings,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Logo } from './Logo';
import { ReadinessResponse } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  readiness: ReadinessResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, readiness }) => {
  const isAiOnline = readiness?.ai_provider_ready ?? false;
  const isDbOnline = readiness?.database_connected ?? false;
  const isDegraded = !isAiOnline || !isDbOnline;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Listing', icon: PlusCircle },
    { id: 'saved', label: 'Saved Listings', icon: BookmarkCheck },
    { id: 'brand', label: 'Brand Profile', icon: Palette },
    { id: 'logo', label: 'Logo & Banner', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Unified Logo & Product Brand */}
          <div className="flex items-center cursor-pointer">
            <Logo
              variant="horizontal"
              size="md"
              showBadge={true}
              onClick={() => setCurrentTab('dashboard')}
            />
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicator & Quick Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('settings')}
              title={
                isDegraded
                  ? 'Check Settings: AI inference or database connectivity needs attention'
                  : 'AI & Database Healthy'
              }
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isDegraded
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isDegraded ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isDegraded ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                ></span>
              </span>
              <span className="hidden sm:inline font-mono">
                {readiness?.ai_model || 'gemma3:1b'}
              </span>
              <span className="text-[11px] opacity-80">
                {readiness?.database_type === 'mongodb_atlas' ? 'Atlas' : 'Local DB'}
              </span>
            </button>

            {currentTab !== 'create' && (
              <button
                onClick={() => setCurrentTab('create')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-all shadow-indigo-200 hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Listing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex border-t border-slate-100 bg-white px-2 py-1 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded text-xs font-medium ${
                isActive ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
