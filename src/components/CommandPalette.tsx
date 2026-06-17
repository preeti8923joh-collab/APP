import React, { useState, useEffect, useRef } from "react";
import { WebApp } from "../types";
import { Search, Command, CornerDownLeft, Sparkles, Star } from "lucide-react";
import IconLoader from "./IconLoader";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apps: WebApp[];
  onOpenApp: (app: WebApp) => void;
  favoriteIds: string[];
  isDark: boolean;
}

export default function CommandPalette({
  isOpen,
  onClose,
  apps,
  onOpenApp,
  favoriteIds,
  isDark,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset focus and search state when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keybindings listening inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredApps.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredApps.length) % filteredApps.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredApps[selectedIndex]) {
          onOpenApp(filteredApps[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, search, selectedIndex, apps]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Filter apps in real-time
  const filteredApps = apps.filter((app) => {
    const matchStr = `${app.name} ${app.description} ${app.category}`.toLowerCase();
    return matchStr.includes(search.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="command-palette-modal"
        ref={containerRef}
        className={`w-full max-w-xl rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 ${
          isDark 
            ? "bg-zinc-950/95 border-white/10 backdrop-blur-2xl text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
            : "bg-white/95 border-slate-200 text-slate-800 shadow-purple-500/10"
        }`}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-4 border-b border-white/5">
          <Search className={isDark ? "text-blue-400 mr-2.5" : "text-purple-600 mr-3"} size={20} />
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            placeholder="Type to search and launch instantly... (Esc to close)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none outline-none text-base focus:ring-0 placeholder:text-slate-500 text-slate-200"
          />
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] text-slate-400">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* Search Results List */}
        <div id="command-palette-results" className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <Sparkles className="mx-auto mb-2 text-slate-600 animate-pulse-slow" size={24} />
              No matched applications found.
            </div>
          ) : (
            filteredApps.map((app, index) => {
              const isSelected = index === selectedIndex;
              const isFav = favoriteIds.includes(app.id);

              return (
                <div
                  id={`palette-item-${app.id}`}
                  key={app.id}
                  onClick={() => {
                    onOpenApp(app);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? isDark
                        ? "bg-blue-500/15 border-l-4 border-l-blue-550 pl-2 text-blue-300"
                        : "bg-purple-100 border-l-4 border-l-purple-600 pl-2 text-purple-700 font-medium"
                      : isDark
                      ? "hover:bg-white/5 text-slate-300"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-white/5" : "bg-slate-100"
                      }`}
                    >
                      <IconLoader
                        name={app.icon}
                        className={isSelected ? (isDark ? "text-blue-400" : "text-purple-600") : "text-slate-400"}
                        size={18}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold truncate">{app.name}</span>
                        {isFav && <Star size={11} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-[360px]">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md ${
                        isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {app.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center font-mono text-[9px] text-slate-400 px-1 py-0.5 bg-white/5 rounded border border-white/5 animate-pulse">
                        <span>enter</span>
                        <CornerDownLeft size={8} className="ml-1" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Navigation Footer Guide */}
        <div className={`px-4 py-2 text-[10px] flex items-center justify-between border-t border-white/5 ${
          isDark ? "bg-black/60 text-slate-500" : "bg-slate-50 text-slate-500"
        }`}>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="px-1 py-0.2 border border-slate-700/50 rounded bg-slate-800 text-[9px] font-mono mr-1">↑↓</span>
              Navigate
            </span>
            <span className="flex items-center">
              <span className="px-1 py-0.2 border border-slate-700/50 rounded bg-slate-800 text-[9px] font-mono mr-1">Enter</span>
              Launch
            </span>
            <span className="flex items-center">
              <span className="px-1 py-0.2 border border-slate-700/50 rounded bg-slate-800 text-[9px] font-mono mr-1">Esc</span>
              Close
            </span>
          </div>
          <span>Total: {filteredApps.length} tools</span>
        </div>
      </div>
    </div>
  );
}
