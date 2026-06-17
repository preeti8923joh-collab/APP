import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Resolve paths
const DATA_DIR = path.resolve(process.cwd(), "data");
const APPS_FILE = path.join(DATA_DIR, "apps_db.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics_db.json");

// Ensure data directory and databases exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_APPS = [
  {
    id: "gemini",
    name: "Gemini Workspace",
    description: "Google's powerful AI model workspace for research, code, and content creation.",
    url: "https://gemini.google.com",
    category: "AI Tools",
    icon: "Sparkles",
    isDefault: true
  },
  {
    id: "deepseek",
    name: "DeepSeek AI",
    description: "Advanced reasoning artificial intelligence assistant with deep coding expertise.",
    url: "https://www.deepseek.com",
    category: "AI Tools",
    icon: "Brain",
    isDefault: true
  },
  {
    id: "excalidraw",
    name: "Excalidraw Studio",
    description: "Virtual collaborative whiteboard for sketching hand-drawn diagrams and wireframes.",
    url: "https://excalidraw.com",
    category: "Creator Tools",
    icon: "PenTool",
    isDefault: true
  },
  {
    id: "wolfram",
    name: "WolframAlpha",
    description: "Compute mathematical questions using expert algorithms and deep knowledge models.",
    url: "https://www.wolframalpha.com",
    category: "Study Tools",
    icon: "Calculator",
    isDefault: true
  },
  {
    id: "github",
    name: "GitHub Developer Portal",
    description: "Manage repositories, pull requests, and deploy advanced secure software integrations.",
    url: "https://github.com",
    category: "Admin Tools",
    icon: "Github",
    isDefault: true
  },
  {
    id: "duolingo",
    name: "Duolingo Languages",
    description: "Learn global languages, grammar, and pronunciation with short lessons.",
    url: "https://www.duolingo.com",
    category: "Study Tools",
    icon: "Languages",
    isDefault: true
  },
  {
    id: "regex101",
    name: "Regex101 Playground",
    description: "Full-scale Regular Expression analyzer, generator, and sandbox debugging hub.",
    url: "https://regex101.com",
    category: "Utilities",
    icon: "Terminal",
    isDefault: true
  },
  {
    id: "json-formatter",
    name: "JSON Interactive Formatter",
    description: "Validate, beautify, and parse raw string payloads into beautiful interactive structural trees.",
    url: "https://jsonformatter.org",
    category: "Utilities",
    icon: "FileCode",
    isDefault: true
  }
];

if (!fs.existsSync(APPS_FILE)) {
  fs.writeFileSync(APPS_FILE, JSON.stringify(DEFAULT_APPS, null, 2), "utf-8");
}

if (!fs.existsSync(ANALYTICS_FILE)) {
  const initialAnalytics = DEFAULT_APPS.map(app => ({ id: app.id, clickCount: 0 }));
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialAnalytics, null, 2), "utf-8");
}

// Helpers for read/write
function readApps() {
  try {
    const raw = fs.readFileSync(APPS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading apps database, healing with defaults", err);
    return DEFAULT_APPS;
  }
}

function writeApps(data: any) {
  fs.writeFileSync(APPS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function readAnalytics() {
  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeAnalytics(data: any) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Express configurations
app.use(express.json());

// API: Get apps merged with click counters
app.get("/api/apps", (req, res) => {
  const apps = readApps();
  const analytics = readAnalytics();
  
  const merged = apps.map((appItem: any) => {
    const analytic = analytics.find((a: any) => a.id === appItem.id);
    return {
      ...appItem,
      clickCount: analytic ? analytic.clickCount : 0
    };
  });
  
  res.json(merged);
});

// API: Post click on card
app.post("/api/apps/:id/click", (req, res) => {
  const appId = req.params.id;
  const analytics = readAnalytics();
  const index = analytics.findIndex((a: any) => a.id === appId);
  
  if (index !== -1) {
    analytics[index].clickCount += 1;
  } else {
    analytics.push({ id: appId, clickCount: 1 });
  }
  
  writeAnalytics(analytics);
  res.json({ success: true, id: appId, clickCount: index !== -1 ? analytics[index].clickCount : 1 });
});

// API: Create new app
app.post("/api/apps", (req, res) => {
  const { name, description, url, category, icon } = req.body;
  
  if (!name || !description || !url || !category || !icon) {
    return res.status(400).json({ error: "All fields (name, description, url, category, icon) are required." });
  }
  
  const apps = readApps();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-6);
  
  const newApp = {
    id,
    name,
    description,
    url,
    category,
    icon,
    isDefault: false
  };
  
  apps.push(newApp);
  writeApps(apps);
  
  // also add click record
  const analytics = readAnalytics();
  analytics.push({ id, clickCount: 0 });
  writeAnalytics(analytics);
  
  res.status(201).json(newApp);
});

// API: Update an existing app
app.put("/api/apps/:id", (req, res) => {
  const appId = req.params.id;
  const { name, description, url, category, icon } = req.body;
  
  if (!name || !description || !url || !category || !icon) {
    return res.status(400).json({ error: "All fields are required during update." });
  }
  
  const apps = readApps();
  const index = apps.findIndex((a: any) => a.id === appId);
  
  if (index === -1) {
    return res.status(404).json({ error: "App not found." });
  }
  
  apps[index] = {
    ...apps[index],
    name,
    description,
    url,
    category,
    icon
  };
  
  writeApps(apps);
  res.json(apps[index]);
});

// API: Delete an app
app.delete("/api/apps/:id", (req, res) => {
  const appId = req.params.id;
  const apps = readApps();
  const index = apps.findIndex((a: any) => a.id === appId);
  
  if (index === -1) {
    return res.status(404).json({ error: "App not found." });
  }
  
  const deleted = apps.splice(index, 1);
  writeApps(apps);
  
  // Clean from analytics as well
  const analytics = readAnalytics();
  const analyticsIndex = analytics.findIndex((a: any) => a.id === appId);
  if (analyticsIndex !== -1) {
    analytics.splice(analyticsIndex, 1);
    writeAnalytics(analytics);
  }
  
  res.json({ success: true, deleted: deleted[0] });
});

// Server configuration & boot
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational on http://localhost:${PORT}`);
  });
}

startServer();
