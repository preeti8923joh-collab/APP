export interface WebApp {
  id: string;
  name: string;
  description: string;
  url: string;
  category: AppCategory;
  icon: string; // Lucide icon name, e.g. "Sparkles", "Code", "Briefcase"
  isDefault?: boolean;
}

export type AppCategory = "AI Tools" | "Study Tools" | "Creator Tools" | "Admin Tools" | "Utilities";

export interface AppAnalytics {
  id: string;
  clickCount: number;
}

export interface AdminSettings {
  adminEmail: string;
  isAuthenticated: boolean;
}
