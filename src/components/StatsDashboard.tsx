import React from "react";
import { WebApp } from "../types";
import { BarChart3, Activity, Orbit, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import IconLoader from "./IconLoader";

interface StatsDashboardProps {
  apps: (WebApp & { clickCount?: number })[];
  isDark: boolean;
  onOpenApp: (app: WebApp) => void;
}

export default function StatsDashboard({ apps, isDark, onOpenApp }: StatsDashboardProps) {
  // Aggregate stats
  const totalApps = apps.length;
  const totalClicks = apps.reduce((sum, app) => sum + (app.clickCount || 0), 0);
  
  // Find top visited app
  const sortedApps = [...apps].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  const topApp = sortedApps[0];
  const topThree = sortedApps.slice(0, 3).filter(a => (a.clickCount || 0) > 0);

  // Group visits count by category
  const categoryStats = apps.reduce((acc, app) => {
    const clicks = app.clickCount || 0;
    acc[app.category] = (acc[app.category] || 0) + clicks;
    return acc;
  }, {} as Record<string, number>);

  const categories = ["AI Tools", "Study Tools", "Creator Tools", "Admin Tools", "Utilities"];

  return (
    <div
      id="analytics-dashboard-panel"
      className={`rounded-2xl border p-6 transition-all duration-350 animate-fade-in ${
        isDark 
          ? "bg-white/5 border-white/10 backdrop-blur-md shadow-[0_12px_40px_0_rgba(0,0,0,0.6)]" 
          : "bg-white/60 border-slate-200/80 shadow-md"
      }`}
    >
      {/* Title */}
      <div className="flex items-center space-x-2 mb-6">
        <div className={`p-1.5 rounded-lg ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-purple-100 text-purple-600"}`}>
          <BarChart3 size={18} />
        </div>
        <div>
          <h2 className={`text-base font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Launcher Diagnostic Telemetry
          </h2>
          <p className="text-[10px] text-slate-400">
            Real-time analytics and web redirect access frequencies
          </p>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Core Metrics Bento */}
        <div className={`rounded-xl p-4 border flex flex-col justify-between ${
          isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Aggregated Visits
          </span>
          <div className="my-3 flex items-baseline space-x-1.5">
            <span className={`text-3xl font-black ${isDark ? "text-blue-400 text-glow-blue" : "text-purple-600"}`}>
              {totalClicks}
            </span>
            <span className="text-xs text-slate-400">clicks</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
              {totalApps} registered nodes
            </span>
          </div>
        </div>

        {/* Most Frequented Node */}
        <div className={`rounded-xl p-4 border flex flex-col justify-between ${
          isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
            <TrendingUp size={10} className="text-blue-400" />
            <span>Apex Web App</span>
          </span>
          
          {topApp && (topApp.clickCount || 0) > 0 ? (
            <div 
              id="top-app-click-anchor"
              onClick={() => onOpenApp(topApp)}
              className="my-3 flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className={`p-2 rounded-lg transition-transform group-hover:scale-105 ${
                isDark ? "bg-white/5" : "bg-slate-200"
              }`}>
                <IconLoader name={topApp.icon} className={isDark ? "text-blue-400" : "text-purple-600"} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className={`text-sm font-bold truncate ${isDark ? "text-slate-100 group-hover:text-blue-450" : "text-slate-800"}`}>
                  {topApp.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {topApp.clickCount || 0} secure handshakes
                </p>
              </div>
            </div>
          ) : (
            <div className="my-3 text-slate-500 text-xs flex items-center space-x-1.5">
              <Orbit className="animate-spin-slow text-slate-600" size={14} />
              <span>Diagnostic data loading...</span>
            </div>
          )}

          <div className="text-[9px] text-slate-400">
            {topApp && (topApp.clickCount || 0) > 0 
              ? `Leads navigation requests at ${Math.round(((topApp.clickCount || 0) / (totalClicks || 1)) * 100)}% weight` 
              : "Click any application card below to start telemetry routing."}
          </div>
        </div>

        {/* Category Access Balance */}
        <div className={`rounded-xl p-4 border flex flex-col justify-between md:col-span-1 ${
          isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Routing Ratios
          </span>
          
          <div className="my-2.5 space-y-1.5">
            {categories.map((cat) => {
              const clicks = categoryStats[cat] || 0;
              const pct = totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0;
              
              // Colors for styling
              const colors: Record<string, string> = {
                "AI Tools": "bg-blue-400",
                "Study Tools": "bg-emerald-400",
                "Creator Tools": "bg-purple-400",
                "Admin Tools": "bg-amber-400",
                "Utilities": "bg-indigo-400",
              };

              return (
                <div key={cat} className="space-y-0.5 text-xs">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span className="truncate">{cat}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className={`w-full h-1 rounded-full ${isDark ? "bg-white/5" : "bg-slate-200"}`}>
                    <div
                      className={`h-1 rounded-full ${colors[cat] || "bg-violet-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard Row */}
      {topThree.length > 0 && (
        <div className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          isDark ? "bg-white/5 border-white/5" : "bg-slate-50/50 border-slate-100"
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
            <Sparkles size={11} className="text-amber-400" />
            <span>Leaderboard:</span>
          </span>
          <div className="flex flex-wrap items-center gap-4">
            {topThree.map((app, i) => (
              <div 
                id={`leader-item-${app.id}`}
                key={app.id} 
                onClick={() => onOpenApp(app)}
                className="flex items-center space-x-1.5 cursor-pointer text-xs group"
              >
                <span className="font-mono text-blue-400 font-black text-[10px]">#{i+1}</span>
                <span className={`font-semibold truncate transition-colors ${
                  isDark ? "text-slate-300 group-hover:text-blue-400" : "text-slate-700 group-hover:text-purple-600"
                }`}>
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-400">({app.clickCount})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
