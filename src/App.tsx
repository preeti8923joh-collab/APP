import React, { useState, useEffect } from "react";
import { WebApp, AppCategory } from "./types";
import Navbar from "./components/Navbar";
import AppCard from "./components/AppCard";
import StatsDashboard from "./components/StatsDashboard";
import AdminPanel from "./components/AdminPanel";
import CommandPalette from "./components/CommandPalette";
import { Star, ShieldAlert, Sparkles, LayoutGrid, Radio, Loader2, HelpCircle } from "lucide-react";

const CATEGORIES: (AppCategory | "All" | "Favorites")[] = [
  "All",
  "Favorites",
  "AI Tools",
  "Study Tools",
  "Creator Tools",
  "Admin Tools",
  "Utilities",
];

export default function App() {
  // Primary State
  const [apps, setApps] = useState<(WebApp & { clickCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Layout State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | "All" | "Favorites">("All");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  // Customization & Tooling State
  const [isDark, setIsDark] = useState<boolean>(true);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<WebApp | undefined>(undefined);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Load preferences from localStorage on mounting
  useEffect(() => {
    // Theme loading: Dark mode is default as per instructions
    const savedTheme = localStorage.getItem("hub_dark_theme");
    setIsDark(savedTheme !== null ? savedTheme === "true" : true);

    // Diagnostics panel visibility
    const savedStats = localStorage.getItem("hub_show_stats");
    setShowStats(savedStats !== null ? savedStats === "true" : true);

    // favorites array
    const savedFavs = localStorage.getItem("hub_favorite_ids");
    if (savedFavs) {
      try {
        setFavoriteIds(JSON.parse(savedFavs));
      } catch (e) {
        setFavoriteIds([]);
      }
    }

    // Fetch initial app databases
    fetchApps();
  }, []);

  // Sync localStorage with preferences
  useEffect(() => {
    localStorage.setItem("hub_dark_theme", isDark.toString());
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("hub_show_stats", showStats.toString());
  }, [showStats]);

  useEffect(() => {
    localStorage.setItem("hub_favorite_ids", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Global Ctrl+K Command Palette trigger
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Fetch apps from backend database helper
  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apps");
      if (!res.ok) throw new Error("Faulty handshake during telemetry handshake.");
      const data = await res.json();
      setApps(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve app registry.");
    } finally {
      setLoading(false);
    }
  };

  // Launch app link and ping analytics click
  const handleOpenApp = async (appItem: WebApp) => {
    // 1. Instantly open URL in new tab for premium responsive link redirection
    window.open(appItem.url, "_blank", "noopener,noreferrer");

    // 2. Perform optimistic click counter update in UI immediately
    setApps((prev) =>
      prev.map((app) =>
        app.id === appItem.id ? { ...app, clickCount: (app.clickCount || 0) + 1 } : app
      )
    );

    // 3. Ping the server to save the statistics in DB
    try {
      await fetch(`/api/apps/${appItem.id}/click`, { method: "POST" });
    } catch (e) {
      console.warn("Analytics registration bypassed:", e);
    }
  };

  // Create or Update application configs
  const handleSaveApp = async (appObj: Omit<WebApp, "id"> & { id?: string }) => {
    try {
      let response;
      if (appObj.id) {
        // Update
        response = await fetch(`/api/apps/${appObj.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appObj),
        });
      } else {
        // Create
        response = await fetch("/api/apps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appObj),
        });
      }

      if (!response.ok) throw new Error("Failure writing to database registry.");
      
      // Reload and close panel
      setEditingApp(undefined);
      await fetchApps();
    } catch (err: any) {
      alert("Error saving app detail: " + err.message);
    }
  };

  // Delete/Terminate Application Card
  const handleDeleteApp = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this application launching card? This cannot be undone.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Termination failed.");
      
      // Opt-out from favorites if deleted
      if (favoriteIds.includes(id)) {
        setFavoriteIds(favoriteIds.filter(fid => fid !== id));
      }
      
      await fetchApps();
    } catch (err: any) {
      alert("Termination failed: " + err.message);
    }
  };

  // Toggle favorite state
  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // Global filters
  const filteredApps = apps.filter((app) => {
    // Category match
    const categoryMatch =
      selectedCategory === "All" ||
      (selectedCategory === "Favorites" && favoriteIds.includes(app.id)) ||
      app.category === selectedCategory;

    // Search query match
    const queryMatch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase()) ||
      app.category.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && queryMatch;
  });

  // Separate favorites to place at the top of grid or show normal grid
  const favoritesList = apps.filter((app) => favoriteIds.includes(app.id));

  return (
    <div
      id="main-app"
      className={`min-h-screen relative flex flex-col font-sans transition-all duration-300 ${
        isDark 
          ? "bg-[#030303] text-slate-200 selection:bg-blue-500/30 selection:text-blue-300" 
          : "bg-slate-50 text-slate-800 selection:bg-purple-600/20 selection:text-purple-800"
      }`}
    >
      {/* Background Ambience / Cosmic Gradients */}
      {isDark ? (
        <div id="ambient-cosmic-bg" className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full">
          {/* Immersive UI ambient glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Subtle grid mesh layer */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
      ) : (
        <div id="ambient-light-bg" className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full">
          <div className="absolute top-[5%] right-[15%] w-[400px] h-[400px] rounded-full bg-purple-200/40 blur-[90px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-100/50 blur-[80px]" />
          
          {/* Grid texture for sleek professional structure */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_42px]" />
        </div>
      )}

      {/* Primary Navigation System */}
      <Navbar
        search={search}
        setSearch={setSearch}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        showStats={showStats}
        setShowStats={setShowStats}
        isAdmin={isAdmin}
        toggleAdminMode={() => setIsAdmin(!isAdmin)}
        onOpenAdminPanel={() => {
          setEditingApp(undefined);
          setIsAdminPanelOpen(true);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        
        {/* Dynamic Hero Board Header */}
        <div id="hero-banner-section" className="text-center sm:text-left space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border bg-white/5 uppercase border-white/10 text-blue-400">
            <Sparkles size={10} className="text-blue-400 animate-spin-slow" />
            <span>Interactive Tool Suite</span>
          </div>
          
          <div className="space-y-1">
            <h1 id="hero-title" className={`text-3xl sm:text-4xl font-extrabold tracking-tight pb-1 ${
              isDark 
                ? "bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent" 
                : "text-slate-800 bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent"
            }`}>
              Web Applications Hub
            </h1>
            <p id="hero-subtitle" className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Open and orchestrate your entire digital workshop from a premium automated launching interface. Streamline workflow, access categories, and view analytics.
            </p>
          </div>
        </div>

        {/* Telemetry Panel Dashboard - Collapsible */}
        {showStats && (
          <StatsDashboard
            apps={apps}
            isDark={isDark}
            onOpenApp={handleOpenApp}
          />
        )}

        {/* Controls Layout: Category Selection and Favorites Quick Banner */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center space-x-2">
              <LayoutGrid size={16} className="text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Index
              </h2>
            </div>
            
            <button
              id="global-command-hint-btn"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-[10px] text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1 border border-white/5 bg-white/5 rounded-full px-2.5 py-0.5"
            >
              <span>Fuzzy search with</span>
              <kbd className="font-mono bg-white/10 px-1.5 py-0.2 rounded text-slate-300 text-[9px]">Ctrl+K</kbd>
            </button>
          </div>

          {/* Scrolling category list of modern buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrolled-y-hidden">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              let badgeCount = 0;
              if (cat === "All") badgeCount = apps.length;
              else if (cat === "Favorites") badgeCount = favoritesList.length;
              else badgeCount = apps.filter((a) => a.category === cat).length;

              return (
                <button
                  id={`cat-filter-btn-${cat.replace(/\s+/g, "-")}`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border flex items-center space-x-1.5 ${
                    isActive
                      ? isDark
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-md shadow-blue-500/10"
                        : "bg-purple-600 border-purple-700 text-white shadow-md shadow-purple-600/10"
                      : isDark
                      ? "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {cat === "Favorites" && <Star size={11} className={isActive ? "fill-current" : ""} />}
                  <span>{cat}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive 
                      ? isDark ? "bg-blue-500/20 text-blue-400" : "bg-purple-800 text-purple-100"
                      : isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                  }`}>
                    {badgeCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorites Section Overlay (Only when not explicitly in favorites category filter, placing favorited shortcuts at top) */}
        {selectedCategory === "All" && favoritesList.length > 0 && !search && (
          <div id="favorites-section-wrapper" className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 flex items-center space-x-1">
              <Star size={12} fill="currentColor" />
              <span>Prioritized Workbench Links</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoritesList.map((app) => (
                <AppCard
                  key={`fav-${app.id}`}
                  app={app}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenApp={handleOpenApp}
                  isAdmin={isAdmin}
                  onEdit={(editing) => {
                    setEditingApp(editing);
                    setIsAdminPanelOpen(true);
                  }}
                  onDelete={handleDeleteApp}
                  isDark={isDark}
                />
              ))}
            </div>
            
            <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent pt-4" />
          </div>
        )}

        {/* Primary Dynamic App Index Grid */}
        <section id="applications-index-section" className="space-y-4">
          {selectedCategory === "All" && favoritesList.length > 0 && !search && (
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Complete Nodes Index
            </h3>
          )}

          {loading ? (
            /* Elegant loading skeleton */
            <div id="grid-loader-spinner" className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className={`animate-spin ${isDark ? "text-blue-400" : "text-purple-600"}`} size={32} />
              <p className="text-xs text-slate-400 font-mono">Syncing launch frequencies...</p>
            </div>
          ) : error ? (
            /* Warning board */
            <div id="grid-error-board" className="p-8 rounded-2xl border bg-rose-500/10 border-rose-500/20 text-center space-y-3">
              <ShieldAlert className="mx-auto text-rose-500" size={36} />
              <h4 className="text-base font-bold text-rose-400">Retrieval Interface Terminated</h4>
              <p className="text-xs text-slate-400">{error}</p>
              <button
                onClick={fetchApps}
                className="px-4 py-2 rounded-xl text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
              >
                Retry Database Ping
              </button>
            </div>
          ) : filteredApps.length === 0 ? (
            /* Empty placeholder */
            <div id="grid-empty-board" className={`p-16 rounded-2xl border text-center space-y-2 border-dashed ${
              isDark ? "border-white/10 bg-slate-900/10" : "border-slate-300 bg-slate-100/30"
            }`}>
              <Radio className="mx-auto text-slate-600 animate-pulse-slow" size={32} />
              <h4 className="text-sm font-bold text-slate-400">No Applications Matched Search criteria</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active registration files matched `{search}` or selected tagging category. Add or search other queries.
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`mt-4 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-white hover:bg-slate-100 border text-slate-700"
                  }`}
                >
                  Clear text filters
                </button>
              )}
            </div>
          ) : (
            /* Grid container */
            <div
              id="app-cards-grid"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  isFavorite={favoriteIds.includes(app.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenApp={handleOpenApp}
                  isAdmin={isAdmin}
                  onEdit={(editing) => {
                    setEditingApp(editing);
                    setIsAdminPanelOpen(true);
                  }}
                  onDelete={handleDeleteApp}
                  isDark={isDark}
                />
              ))}

              {/* Instant Add My App Card */}
              <button
                id="grid-btn-add-shortcut"
                onClick={() => {
                  setEditingApp(undefined);
                  setIsAdminPanelOpen(true);
                }}
                className={`group relative flex flex-col items-center justify-center p-6 h-full min-h-[220px] rounded-2xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer ${
                  isDark
                    ? "border-white/10 hover:border-blue-500/40 bg-white/[0.01] hover:bg-white/[0.03] text-slate-400 hover:text-blue-400"
                    : "border-slate-300 hover:border-purple-600 bg-slate-50/50 hover:bg-slate-100/50 text-slate-500 hover:text-purple-600"
                }`}
              >
                <div className={`p-3 rounded-xl border mb-3 transition-transform group-hover:scale-110 flex items-center justify-center w-12 h-12 ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                }`}>
                  <span className="text-xl font-bold leading-none select-none">+</span>
                </div>
                <h3 className="text-sm font-bold tracking-tight">Add Custom App</h3>
                <p className="text-[10px] text-slate-500 mt-1.5 max-w-[180px]">
                  Instantly register your web app URLs directly here
                </p>
              </button>
            </div>
          )}
        </section>

      </main>

      {/* Futuristic footer credentials */}
      <footer className={`mt-auto py-6 border-t ${
        isDark ? "bg-black/40 border-white/5 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:items-center sm:justify-between text-[11px] leading-relaxed select-none">
          <p>© 2026 Developer Workbench. Integrated under sandboxed sandbox. Handshakes fully audited.</p>
          <div className="flex justify-center space-x-4 mt-2 sm:mt-0 font-mono">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Database Online
            </span>
            <span>API v1.0.2</span>
          </div>
        </div>
      </footer>

      {/* Advanced Component 1: Admin Panel Dialog */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          setEditingApp(undefined);
        }}
        onSaveApp={handleSaveApp}
        editingApp={editingApp}
        isDark={isDark}
      />

      {/* Advanced Component 2: Keyboard Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        apps={apps}
        onOpenApp={handleOpenApp}
        favoriteIds={favoriteIds}
        isDark={isDark}
      />
    </div>
  );
}
