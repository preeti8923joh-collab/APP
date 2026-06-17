import React from "react";
import * as Lucide from "lucide-react";

interface IconLoaderProps {
  name: string;
  className?: string;
  size?: number;
}

export default function IconLoader({ name, className = "", size = 20 }: IconLoaderProps) {
  // Resolve icon safely
  const IconComponent = (Lucide as any)[name];

  if (!IconComponent) {
    // Elegant fallback icon if nothing matched
    const Fallback = Lucide.Globe;
    return <Fallback className={className} size={size} id={`fallback-icon-${name}`} />;
  }

  return <IconComponent className={className} size={size} id={`icon-${name}`} />;
}
