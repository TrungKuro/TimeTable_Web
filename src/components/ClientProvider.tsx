"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { settings } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Handle Dark/Light Theme
    if (settings.theme === "dark" || 
       (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Handle Accent Color
    // Remove old theme classes
    root.classList.forEach(className => {
      if (className.startsWith("theme-")) {
        root.classList.remove(className);
      }
    });
    root.classList.add(`theme-${settings.accentColor}`);

  }, [settings.theme, settings.accentColor, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() === 0) {
        const { sendTelegramReport } = await import('@/utils/telegramReport');
        await sendTelegramReport();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}
