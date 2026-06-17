import React, { useState, useEffect } from "react";
import { WebApp, AppCategory } from "../types";
import { X, Plus, Sparkles, FolderPlus, Trash2, Edit3, Save, Info, KeyRound } from "lucide-react";
import IconLoader from "./IconLoader";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApp: (app: Omit<WebApp, "id"> & { id?: string }) => void;
  editingApp?: WebApp;
  isDark: boolean;
}

const AVAILABLE_ICONS = [
  "Sparkles", "Brain", "PenTool", "Calculator", "Github", 
  "Languages", "Terminal", "FileCode", "Activity", "Layers", 
  "Globe", "Folder", "Cpu", "User", "Crown", "Database"
];

const CATEGORIES: AppCategory[] = ["AI Tools", "Study Tools", "Creator Tools", "Admin Tools", "Utilities"];

export default function AdminPanel({
  isOpen,
  onClose,
  onSaveApp,
  editingApp,
  isDark,
}: AdminPanelProps) {
  // Passcode verification
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<AppCategory>("AI Tools");
  const [icon, setIcon] = useState("Sparkles");
  const [validationError, setValidationError] = useState("");

  // Setup form if editing
  useEffect(() => {
    if (editingApp) {
      setName(editingApp.name);
      setDescription(editingApp.description);
      setUrl(editingApp.url);
      setCategory(editingApp.category);
      setIcon(editingApp.icon);
      // Skip passcode if already unlocked or editing
      setIsUnlocked(true);
    } else {
      resetForm();
    }
  }, [editingApp, isOpen]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setUrl("");
    setCategory("AI Tools");
    setIcon("Sparkles");
    setValidationError("");
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default secret: admin123 (also accept any simple phrase for hassle-free preview testing!)
    if (passcode.trim().toLowerCase() === "admin123" || passcode.trim() === "") {
      setIsUnlocked(true);
      setAuthError("");
    } else {
      setAuthError("Invalid Security Token. Hint: Leave empty or type 'admin123'.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) return setValidationError("Developer Name is required.");
    if (!description.trim()) return setValidationError("Short descriptive summary is required.");
    if (!url.trim()) return setValidationError("Target Web App URL is required.");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return setValidationError("URL must begin with http:// or https://");
    }

    onSaveApp({
      id: editingApp?.id,
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      category,
      icon,
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-form-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/80 backdrop-blur-xl animate-fade-in"
    >
      <div
        id="admin-form-modal"
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isDark 
            ? "bg-zinc-950/95 border-white/10 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
            : "bg-white border-slate-200 text-slate-800 shadow-purple-500/10"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center space-x-2">
            <Sparkles className={isDark ? "text-blue-400" : "text-purple-600"} size={20} />
            <h2 id="admin-modal-title" className="text-lg font-bold">
              {editingApp ? `Tune Application: ${editingApp.name}` : "Integrate New Application"}
            </h2>
          </div>
          <button
            id="admin-modal-btn-close"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Application Editor Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {validationError}
              </div>
            )}

            {/* App Name */}
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-slate-400">Application Name</label>
              <input
                id="admin-form-name"
                type="text"
                maxLength={40}
                placeholder="e.g., Excalidraw Sketchboard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/5 border-white/10 focus:border-blue-500 text-slate-200"
                    : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-800"
                }`}
              />
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Target Web App URL</label>
              <input
                id="admin-form-url"
                type="text"
                placeholder="https://excalidraw.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/5 border-white/10 focus:border-blue-500 text-slate-200"
                    : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-800"
                }`}
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Short Description</label>
              <textarea
                id="admin-form-desc"
                rows={2}
                maxLength={120}
                placeholder="Write a clear, brief 1-2 sentence description of what the web application does."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all resize-none ${
                  isDark
                    ? "bg-white/5 border-white/10 focus:border-blue-500 text-slate-200 resize-none"
                    : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-800"
                }`}
              />
            </div>

            {/* Grid for Selector Elements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Category Tag</label>
                <select
                  id="admin-form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppCategory)}
                  className={`w-full px-4 py-2 rounded-xl text-sm border outline-none transition-all ${
                    isDark
                      ? "bg-zinc-900 border-white/10 focus:border-blue-500 text-slate-200"
                      : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-800"
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Icon View */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Selected Icon</span>
                  <span className="font-mono text-[9px] text-blue-400">{icon}</span>
                </label>
                <div
                  className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-center space-x-2 ${
                    isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <IconLoader name={icon} className={isDark ? "text-blue-400" : "text-purple-600"} size={18} />
                  <span className="text-xs text-slate-400">Sample Render</span>
                </div>
              </div>
            </div>

            {/* Premium Icon Selection Palette */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Choose Launcher Glyph</label>
              <div className={`grid grid-cols-8 gap-2 p-2.5 rounded-xl border ${
                isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
              }`}>
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    id={`admin-btn-icon-${ic}`}
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                      icon === ic
                        ? isDark
                          ? "bg-blue-500/20 border-2 border-blue-400 text-blue-400 scale-110"
                          : "bg-purple-100 border-2 border-purple-600 text-purple-600 scale-110"
                        : isDark
                        ? "bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white"
                        : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <IconLoader name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-end space-x-3">
              <button
                id="admin-btn-cancel"
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Cancel
              </button>
              <button
                id="admin-form-submit"
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center space-x-1.5 ${
                  isDark 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                }`}
              >
                {editingApp ? <Save size={14} /> : <FolderPlus size={14} />}
                <span>{editingApp ? "Save Configurations" : "Launch Application"}</span>
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
