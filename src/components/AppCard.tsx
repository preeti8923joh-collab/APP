import React, { useState } from "react";
import { WebApp } from "../types";
import IconLoader from "./IconLoader";
import { Star, ExternalLink, Activity, Edit3, Trash2 } from "lucide-react";

interface AppCardProps {
  key?: string;
  app: WebApp & { clickCount?: number };
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenApp: (app: WebApp) => void;
  isAdmin: boolean;
  onEdit: (app: WebApp) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
}

export default function AppCard({
  app,
  isFavorite,
  onToggleFavorite,
  onOpenApp,
  isAdmin,
  onEdit,
  onDelete,
  isDark,
}: AppCardProps) {
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");

  // Interactive 3D Card Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Rotate within a 10-degree range for premium feel
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  // Color categories mapped beautifully
  const categoryColors: Record<string, { bg: string; text: string; glow: string }> = {
    "AI Tools": { 
      bg: "bg-blue-500/10", 
      text: "text-blue-400 font-semibold", 
      glow: "shadow-blue-500/20" 
    },
    "Study Tools": { 
      bg: "bg-emerald-500/10", 
      text: "text-emerald-400 font-semibold", 
      glow: "shadow-emerald-500/20" 
    },
    "Creator Tools": { 
      bg: "bg-purple-500/10", 
      text: "text-purple-400 font-semibold", 
      glow: "shadow-purple-500/20" 
    },
    "Admin Tools": { 
      bg: "bg-amber-500/10", 
      text: "text-amber-400 font-semibold", 
      glow: "shadow-amber-500/20" 
    },
    "Utilities": { 
      bg: "bg-indigo-500/10", 
      text: "text-indigo-400 font-semibold", 
      glow: "shadow-indigo-500/20" 
    },
  };

  const themeColors = categoryColors[app.category] || categoryColors["Utilities"];

  return (
    <div
      id={`card-container-${app.id}`}
      style={{ transform, transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl p-6 flex flex-col justify-between h-[260px] cursor-pointer group select-none transition-all duration-300 ${
        isDark ? "glass-dark glass-dark-hover" : "glass-light glass-light-hover"
      }`}
      onClick={() => onOpenApp(app)}
    >
      {/* Glow Effects */}
      <div
        id={`card-glow-${app.id}`}
        className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
      />
      
      {/* Card Header */}
      <div className="flex items-start justify-between">
        {/* App Icon Circle with category gradient glow */}
        <div
          id={`card-icon-wrapper-${app.id}`}
          className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-500 border-2 ${
            isDark 
              ? "bg-white/5 border-white/5 group-hover:border-blue-500/40" 
              : "bg-slate-100/80 border-slate-200/80 group-hover:border-purple-400/40"
          }`}
        >
          <div className="group-hover:scale-110 transition-transform duration-300">
            <IconLoader 
              name={app.icon} 
              className={isDark ? "text-blue-400" : "text-purple-600"} 
              size={24} 
            />
          </div>
        </div>

        {/* Action Controls (Stars / Edits) */}
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <>
              <button
                id={`btn-edit-${app.id}`}
                onClick={() => onEdit(app)}
                className="p-1.5 rounded-lg border transition-colors bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 p-2"
                title="Edit Application"
              >
                <Edit3 size={14} />
              </button>
              <button
                id={`btn-delete-${app.id}`}
                onClick={() => onDelete(app.id)}
                className="p-1.5 rounded-lg border transition-colors bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                title="Delete Application"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          <button
            id={`btn-fav-${app.id}`}
            onClick={() => onToggleFavorite(app.id)}
            className={`p-1.5 rounded-lg border transition-all duration-300 ${
              isFavorite
                ? "bg-amber-400/20 border-amber-400/50 text-amber-400 scale-105"
                : isDark
                ? "bg-white/5 border-white/10 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/25"
                : "bg-slate-100 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-400/10 hover:border-amber-400/20"
            }`}
            title={isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
          >
            <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="mt-4 flex-grow">
        <h3
          id={`card-title-${app.id}`}
          className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
            isDark ? "text-slate-100 group-hover:text-blue-400" : "text-slate-800 group-hover:text-purple-600"
          }`}
        >
          {app.name}
        </h3>
        
        <p
          id={`card-desc-${app.id}`}
          className={`text-xs mt-1.5 overflow-hidden text-ellipsis line-clamp-2 leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {app.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-white/5">
        <span
          id={`card-badge-${app.id}`}
          className={`text-[10px] px-2.5 py-1 rounded-full border border-transparent transition-all duration-300 ${themeColors.bg} ${themeColors.text}`}
        >
          {app.category}
        </span>

        {/* Clicks and External icon */}
        <div className="flex items-center space-x-3 text-slate-500">
          <div
            id={`card-clicks-${app.id}`}
            className="flex items-center space-x-1 text-[11px]"
            title={`${app.clickCount || 0} visits tracked`}
          >
            <Activity size={10} className="text-emerald-400 animate-pulse" />
            <span className={isDark ? "text-slate-400" : "text-slate-600"}>
              {app.clickCount || 0}
            </span>
          </div>

          <div
            id={`card-launch-${app.id}`}
            className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-300 ${
              isDark 
                ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-black group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                : "bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
            }`}
          >
            <span className="text-[10px]">Launch</span>
            <ExternalLink size={10} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
