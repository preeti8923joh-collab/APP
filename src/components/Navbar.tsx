import React from "react";
import { Moon, Sun, Search, Command, BarChart3, KeyRound, Plus, Sparkles, Orbit } from "lucide-react";

interface NavbarProps {
  search: string;
  setSearch: (s: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  isAdmin: boolean;
  toggleAdminMode: () => void;
  onOpenAdminPanel: () => void;
  onOpenCommandPalette: () => void;
}

export default function Navbar({
  search,
  setSearch,
  isDark,
  toggleTheme,
  showStats,
  setShowStats,
  isAdmin,
  toggleAdminMode,
  onOpenAdminPanel,
  onOpenCommandPalette,
}: NavbarProps) {
  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-xl ${
        isDark 
          ? "bg-black/40 border-white/5 text-slate-200" 
          : "bg-white/60 border-slate-200/80 text-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div id="brand-logo-wrapper" className="flex items-center space-x-3 shrink-0 select-none">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Orbit className="animate-spin-slow text-white" size={16} />
            <div className="absolute inset-0 bg-blue-500/20 blur rounded-lg animate-pulse" />
          </div>
          <div>
            <span id="brand-name" className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              NEXUS LAUNCHER
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold text-slate-400 ml-1.5 bg-white/5 px-1.5 py-0.2 rounded border border-white/5 uppercase">
              v4.2
            </span>
          </div>
        </div>

        {/* Unified Search Input Component */}
        <div className="hidden md:flex items-center flex-grow max-w-md mx-8 relative">
          <Search className="absolute left-3.5 text-slate-500" size={14} />
          <input
            id="nav-search-input"
            type="text"
            placeholder="Search applications... (Ctrl + K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-16 py-2 rounded-full text-xs border outline-none transition-all ${
              isDark
                ? "bg-white/5 border-white/10 focus:border-blue-500/50 text-slate-200 placeholder:text-slate-500"
                : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-800 placeholder:text-slate-500"
            }`}
          />
          <button
            id="nav-btn-cmd-hotkey"
            onClick={onOpenCommandPalette}
            className="absolute right-3.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
            title="Press Ctrl + K to open Command Palette"
          >
            <Command size={8} />
            <span>K</span>
          </button>
        </div>

        {/* Global Controls Platform */}
        <div className="flex items-center space-x-2">
          {/* Quick Hotkey launcher mobile icon */}
          <button
            id="nav-btn-cmd-palette-mobile"
            onClick={onOpenCommandPalette}
            className={`md:hidden p-1.5 rounded-lg border transition-colors ${
              isDark 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title="Quick Command Search"
          >
            <Command size={14} />
          </button>

          {/* Stats Telemetry Toggle */}
          <button
            id="nav-btn-toggle-stats"
            onClick={() => setShowStats(!showStats)}
            className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1.5 text-xs ${
              showStats
                ? isDark
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-purple-100 border-purple-200 text-purple-700 font-semibold"
                : isDark
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title={showStats ? "Hide Launch Statistics" : "Show Access Statistics"}
          >
            <BarChart3 size={14} />
            <span className="hidden lg:inline text-[10px]">Diagnostics</span>
          </button>

          {/* Admin Mode Toggle */}
          <button
            id="nav-btn-toggle-admin"
            onClick={toggleAdminMode}
            className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1.5 text-xs ${
              isAdmin
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold"
                : isDark
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title={isAdmin ? "Exit Developer Mode" : "Unlock Developer Options"}
          >
            <KeyRound size={14} />
            <span className="hidden lg:inline text-[10px]">
              {isAdmin ? "Admin Active" : "Developer"}
            </span>
          </button>

          {/* If admin is enabled, show direct quick ADD button */}
          {isAdmin && (
            <button
              id="nav-admin-btn-add"
              onClick={onOpenAdminPanel}
              className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-500 text-white border-transparent font-extrabold shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-purple-600 hover:bg-purple-500 text-white border-transparent font-semibold"
              }`}
              title="Add My App Instantly"
            >
              <Plus size={14} />
              <span className="hidden sm:inline text-[10px]">+ Add App</span>
            </button>
          )}

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Dark / Light Toggle */}
          <button
            id="nav-btn-toggle-theme"
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-amber-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Futuristic Dark"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

      </div>
    </header>
  );
}
